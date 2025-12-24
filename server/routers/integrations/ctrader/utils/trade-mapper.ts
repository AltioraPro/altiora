import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import type { Database } from "@/server/db";
import { advancedTrades } from "@/server/db/schema";
import type { CTraderPosition, CTraderDeal } from "./ctrader-client";
import { getOrCreateAsset, mapSymbolIdToName } from "./asset-helpers";

/**
 * Map cTrader positions to Altiora advancedTrades format
 */

export interface TradeMapResult {
	created: number;
	updated: number;
	errors: string[];
}

/**
 * Sync cTrader positions to advancedTrades table
 */
export async function syncPositionsToAdvancedTrades(
	db: Database,
	positions: CTraderPosition[],
	journalId: string,
	userId: string,
	accountId: string,
	accountBalance: number,
): Promise<TradeMapResult> {
	const result: TradeMapResult = {
		created: 0,
		updated: 0,
		errors: [],
	};

	for (const position of positions) {
		try {
			// Check if trade already exists
			const existingTrades = await db
				.select()
				.from(advancedTrades)
				.where(
					and(
						eq(advancedTrades.externalId, position.positionId),
						eq(advancedTrades.journalId, journalId),
						eq(advancedTrades.source, "ctrader"),
					)
				)
				.limit(1);
			
			const existing = existingTrades[0];

			const tradeData = mapPositionToTrade(
				position,
				journalId,
				userId,
				accountId,
				accountBalance,
			);

			if (existing) {
				// Update existing trade
				await db
					.update(advancedTrades)
					.set({
						...tradeData,
						updatedAt: new Date(),
					})
					.where(eq(advancedTrades.id, existing.id));

				result.updated++;
			} else {
				// Create new trade
				await db.insert(advancedTrades).values({
					id: nanoid(),
					...tradeData,
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				result.created++;
			}
		} catch (error) {
			const errorMsg = `Failed to sync position ${position.positionId}: ${
				error instanceof Error ? error.message : String(error)
			}`;
			result.errors.push(errorMsg);
			console.error(errorMsg);
		}
	}

	return result;
}

/**
 * Sync cTrader deals (history) to advancedTrades table
 */
export async function syncDealsToAdvancedTrades(
	db: Database,
	deals: CTraderDeal[],
	journalId: string,
	userId: string,
	accountId: string,
	accountBalance: number,
): Promise<TradeMapResult> {
	const result: TradeMapResult = {
		created: 0,
		updated: 0,
		errors: [],
	};

	// GROUP deals by positionId to calculate NET profit per position
	const dealsByPosition = new Map<string, CTraderDeal[]>();
	for (const deal of deals) {
		const posId = deal.positionId;
		if (!dealsByPosition.has(posId)) {
			dealsByPosition.set(posId, []);
		}
		dealsByPosition.get(posId)!.push(deal);
	}

	console.log(`[syncDeals] Grouped ${deals.length} deals into ${dealsByPosition.size} positions`);

	// Process each position (which may have multiple deals)
	for (const [positionId, positionDeals] of dealsByPosition) {
		try {
			// Calculate NET profit for this position (sum of all deals)
			const netProfit = positionDeals.reduce((sum, d) => sum + (d.profit || 0), 0);
			const totalCommission = positionDeals.reduce((sum, d) => sum + (d.commission || 0), 0);
			const totalSwap = positionDeals.reduce((sum, d) => sum + (d.swap || 0), 0);
			
			// Use the LAST deal as the "closing" deal (most recent)
			const lastDeal = positionDeals.sort((a, b) => 
				new Date(b.executionTime).getTime() - new Date(a.executionTime).getTime()
			)[0];
			
			// Find the OPENING deal (without closePositionDetail) to get SL/TP
			const openingDeal = positionDeals.find(d => !d.closePositionDetail) || lastDeal;
			
			// A position is closed if it has profit != 0 (meaning it was closed)
			const isClosed = Math.abs(netProfit) > 0.01; // At least 1 cent
			
			// USER REQUEST: Skip open positions - only sync closed trades
			if (!isClosed) {
				console.log(`[syncDeals] Position ${positionId}: SKIPPED (open position, user requested closed trades only)`);
				continue;
			}
			
			// Calculate risk from opening deal SL
			const riskInput = calculateRisk(
				openingDeal.executionPrice,
				openingDeal.stopLoss,
				openingDeal.tradeSide
			);
			
			console.log(`[syncDeals] Position ${positionId}: ${positionDeals.length} deals, net profit: ${netProfit.toFixed(2)}€, closed: ${isClosed}, risk: ${riskInput || 'N/A'}`);

			// Check if trade exists (by positionId)
			const existingTrades = await db
				.select()
				.from(advancedTrades)
				.where(
					and(
						eq(advancedTrades.externalId, positionId),
						eq(advancedTrades.journalId, journalId),
						eq(advancedTrades.source, "ctrader"),
					)
				)
				.limit(1);

			const existing = existingTrades[0];
			
			// Map symbol ID to name and create/get asset
			const symbolName = mapSymbolIdToName(lastDeal.symbol);
			const assetId = await getOrCreateAsset(db, symbolName, journalId, userId);
			
			const tradeData = mapAggregatedDealToTrade(
				lastDeal,
				netProfit,
				totalCommission,
				totalSwap,
				isClosed,
				journalId,
				userId,
				accountId,
				assetId, // Pass assetId
				riskInput, // Pass calculated risk
				accountBalance, // Capital for P&L %
			);

			if (existing) {
				// Update existing trade with aggregated data
				await db
					.update(advancedTrades)
					.set({
						...tradeData,
						updatedAt: new Date(),
					})
					.where(eq(advancedTrades.id, existing.id));

				result.updated++;
			} else {
				// Create new trade from aggregated deals
				await db.insert(advancedTrades).values({
					id: nanoid(),
					...tradeData,
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				result.created++;
			}
		} catch (error) {
			const errorMsg = `Failed to sync position ${positionId}: ${
				error instanceof Error ? error.message : String(error)
			}`;
			result.errors.push(errorMsg);
			console.error(errorMsg);
		}
	}

	return result;
}

/**
 * Calculate risk percentage based on entry price and stop loss
 */
function calculateRisk(
	entryPrice: number,
	stopLoss: number | undefined,
	tradeSide: "BUY" | "SELL",
): string | null {
	if (!stopLoss || !entryPrice || entryPrice === 0) {
		return null;
	}

	const priceDiff = Math.abs(entryPrice - stopLoss);
	const riskPercent = (priceDiff / entryPrice) * 100;

	return riskPercent.toFixed(2);
}

/**
 * Map a single cTrader position to trade format
 */
function mapPositionToTrade(
	position: CTraderPosition,
	journalId: string,
	userId: string,
	accountId: string,
	accountBalance: number,
) {
	// Calculate P&L percentage: (profit / capital) * 100
	let profitLossPercentage = "0";
	
	if (position.profitLoss !== 0 && accountBalance > 0) {
		profitLossPercentage = ((position.profitLoss / accountBalance) * 100).toFixed(2);
	} else if (position.entryPrice && position.currentPrice) {
		// Fallback: Calculate Price Change %
		// This represents the market move %, not the ROI on account balance
		const diff = position.currentPrice - position.entryPrice;
		const rawPercent = (diff / position.entryPrice) * 100;
		const signedPercent = position.tradeSide === "BUY" ? rawPercent : -rawPercent;
		profitLossPercentage = signedPercent.toFixed(2);
	}
	
	console.log(`[P&L%] Position: profit=${position.profitLoss}, capital=${accountBalance}, %=${profitLossPercentage}`);
	
	// Calculate risk if stopLoss is available
	const riskInput = calculateRisk(position.entryPrice, position.stopLoss, position.tradeSide);

	return {
		userId,
		journalId,
		assetId: null, 
		sessionId: null,
		tradeDate: new Date(position.openTimestamp),
		riskInput, // Calculated from SL
		
		// Map profitLossAmount directly from cTrader data
		profitLossAmount: position.profitLoss.toString(),
		
		profitLossPercentage,
		exitReason: null,
		breakEvenThreshold: "0.1",
		tradingviewLink: null,
		notes: `cTrader Position - ${position.symbol}${position.stopLoss ? ` | SL: ${position.stopLoss}` : ''}${position.takeProfit ? ` | TP: ${position.takeProfit}` : ''}`,
		isClosed: false,

		// Multi-broker fields
		source: "ctrader" as const,
		externalId: position.positionId,
		externalAccountId: accountId,
		syncStatus: "synced" as const,
		lastSyncedAt: new Date(),
		syncMetadata: JSON.stringify({
			symbol: position.symbol,
			tradeSide: position.tradeSide,
			volume: position.volume,
			entryPrice: position.entryPrice,
			currentPrice: position.currentPrice,
			swap: position.swap,
			commission: position.commission,
			pips: position.pips,
			stopLoss: position.stopLoss,
			takeProfit: position.takeProfit,
		}),
	};
}

/**
 * Map aggregated deals (multiple deals for one position) to trade format
 */
function mapAggregatedDealToTrade(
	lastDeal: CTraderDeal,
	netProfit: number,
	totalCommission: number,
	totalSwap: number,
	isClosed: boolean,
	journalId: string,
	userId: string,
	accountId: string,
	assetId: string,
	riskInput: string | null,
	accountBalance: number,
) {
	// Detect exit reason based on NET profit
	let exitReason: string | null = null;
	if (isClosed) {
		// BE only if profit is very close to 0 (within 0.10€ absolute)
		if (Math.abs(netProfit) <= 0.10) {
			exitReason = "BE"; // Break Even
		} else if (netProfit < 0) {
			exitReason = "SL"; // Stop Loss (loss)
		} else {
			exitReason = "TP"; // Take Profit (win)
		}
	}
	
	// Calculate P&L percentage: (profit / capital) * 100
	const profitLossPercentage = accountBalance > 0
		? ((netProfit / accountBalance) * 100).toFixed(2)
		: "0";
	
	console.log(`[P&L%] Deal: profit=${netProfit.toFixed(2)}, capital=${accountBalance}, %=${profitLossPercentage}`);

	return {
		userId,
		journalId,
		assetId, // Auto-created asset
		sessionId: null,
		tradeDate: new Date(lastDeal.executionTime),
		riskInput, // Calculated from opening deal SL
		profitLossAmount: netProfit.toFixed(2), // NET profit
		profitLossPercentage,
		exitReason,
		breakEvenThreshold: "0.1",
		tradingviewLink: null,
		notes: `cTrader - ${lastDeal.symbol}`,
		isClosed,

		source: "ctrader" as const,
		externalId: lastDeal.positionId,
		externalAccountId: accountId,
		syncStatus: "synced" as const,
		lastSyncedAt: new Date(),
		syncMetadata: JSON.stringify({
			symbol: lastDeal.symbol,
			tradeSide: lastDeal.tradeSide,
			volume: lastDeal.volume,
			executionPrice: lastDeal.executionPrice,
			commission: totalCommission,
			swap: totalSwap,
			netProfit: netProfit.toFixed(2),
		}),
	};
}

/**
 * Close positions that are no longer in the open positions list
 */
export async function closeRemovedPositions(
	db: Database,
	currentPositionIds: string[],
	journalId: string,
): Promise<number> {
	try {
		// Find all open cTrader trades for this journal
		const openTrades = await db
			.select()
			.from(advancedTrades)
			.where(
				and(
					eq(advancedTrades.journalId, journalId),
					eq(advancedTrades.source, "ctrader"),
					eq(advancedTrades.isClosed, false),
				)
			);

		let closedCount = 0;

		for (const trade of openTrades) {
			// If trade's externalId is not in current positions, close it
			// BUT: If we are also syncing history, the history sync might have already closed it correctly with real P&L!
			// We should checks if it was updated recently by history sync?
			// For now, naive closure: if not in open list => closed.
			// But we don't know the P&L. So we set P&L to 0 or keep last known?
			
			if (trade.externalId && !currentPositionIds.includes(trade.externalId)) {
				// Only close if not already closed (though query filters for isClosed=false)
				
				await db
					.update(advancedTrades)
					.set({
						isClosed: true,
						updatedAt: new Date(),
						syncStatus: "synced",
						// notes: trade.notes + " (Auto-closed by sync)", // Optional
					})
					.where(eq(advancedTrades.id, trade.id));

				closedCount++;
			}
		}

		return closedCount;
	} catch (error) {
		console.error("Error closing removed positions:", error);
		return 0;
	}
}
