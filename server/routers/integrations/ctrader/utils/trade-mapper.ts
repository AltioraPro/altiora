import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { Database } from "@/server/db";
import { advancedTrades, tradingSessions } from "@/server/db/schema";
import { determineSessionFromTime } from "@/server/routers/trading/utils/auto-sessions";
import { getOrCreateAsset, mapSymbolIdToName } from "./asset-helpers";
import type { CTraderDeal, CTraderPosition } from "./ctrader-client";

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
    accountBalance: number
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
                        eq(advancedTrades.source, "ctrader")
                    )
                )
                .limit(1);

            const existing = existingTrades[0];

            // Auto-assign session based on open timestamp
            const tradeDate = new Date(position.openTimestamp);
            const sessionName = determineSessionFromTime(tradeDate);
            const journalSessions = await db
                .select()
                .from(tradingSessions)
                .where(
                    and(
                        eq(tradingSessions.journalId, journalId),
                        eq(tradingSessions.name, sessionName)
                    )
                )
                .limit(1);
            const sessionId = journalSessions[0]?.id || null;

            // Auto-create asset for the symbol
            const symbolName = mapSymbolIdToName(position.symbol);
            const assetId = await getOrCreateAsset(
                db,
                symbolName,
                journalId,
                userId
            );

            const tradeData = mapPositionToTrade(
                position,
                journalId,
                userId,
                accountId,
                accountBalance,
                sessionId,
                assetId
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
    accountBalance: number
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
        dealsByPosition.get(posId)?.push(deal);
    }

    // Process each position (which may have multiple deals)
    for (const [positionId, positionDeals] of dealsByPosition) {
        try {
            // Calculate NET profit for this position (sum of all deals)
            const netProfit = positionDeals.reduce(
                (sum, d) => sum + (d.profit || 0),
                0
            );
            const totalCommission = positionDeals.reduce(
                (sum, d) => sum + (d.commission || 0),
                0
            );
            const totalSwap = positionDeals.reduce(
                (sum, d) => sum + (d.swap || 0),
                0
            );

            // Use the LAST deal as the "closing" deal (most recent)
            const lastDeal = positionDeals.sort(
                (a, b) =>
                    new Date(b.executionTime).getTime() -
                    new Date(a.executionTime).getTime()
            )[0];

            // Find the OPENING deal (without closePositionDetail) to get SL/TP
            const openingDeal =
                positionDeals.find((d) => !d.closePositionDetail) || lastDeal;

            // A position is closed if it has profit != 0 (meaning it was closed)
            const isClosed = Math.abs(netProfit) > 0.01; // At least 1 cent

            // USER REQUEST: Skip open positions - only sync closed trades
            if (!isClosed) {
                continue;
            }

            // Calculate risk from opening deal SL
            const riskInput = calculateRisk(
                openingDeal.executionPrice,
                openingDeal.stopLoss,
                openingDeal.tradeSide
            );

            // Check if trade exists (by positionId)
            const existingTrades = await db
                .select()
                .from(advancedTrades)
                .where(
                    and(
                        eq(advancedTrades.externalId, positionId),
                        eq(advancedTrades.journalId, journalId),
                        eq(advancedTrades.source, "ctrader")
                    )
                )
                .limit(1);

            const existing = existingTrades[0];

            // Map symbol ID to name and create/get asset
            const symbolName = mapSymbolIdToName(lastDeal.symbol);
            const assetId = await getOrCreateAsset(
                db,
                symbolName,
                journalId,
                userId
            );

            // Auto-assign session based on execution time (close time for closed trades)
            const tradeDate = new Date(lastDeal.executionTime);
            const sessionName = determineSessionFromTime(tradeDate);
            const journalSessions = await db
                .select()
                .from(tradingSessions)
                .where(
                    and(
                        eq(tradingSessions.journalId, journalId),
                        eq(tradingSessions.name, sessionName)
                    )
                )
                .limit(1);
            const sessionId = journalSessions[0]?.id || null;

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
                sessionId // Pass sessionId
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
    _tradeSide: "BUY" | "SELL"
): string | null {
    if (!(stopLoss && entryPrice) || entryPrice === 0) {
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
    sessionId: string | null,
    assetId: string | null
) {
    // Calculate P&L percentage: (profit / capital) * 100
    let profitLossPercentage = "0";

    if (position.profitLoss !== 0 && accountBalance > 0) {
        profitLossPercentage = (
            (position.profitLoss / accountBalance) *
            100
        ).toFixed(2);
    } else if (position.entryPrice && position.currentPrice) {
        // Fallback: Calculate Price Change %
        // This represents the market move %, not the ROI on account balance
        const diff = position.currentPrice - position.entryPrice;
        const rawPercent = (diff / position.entryPrice) * 100;
        const signedPercent =
            position.tradeSide === "BUY" ? rawPercent : -rawPercent;
        profitLossPercentage = signedPercent.toFixed(2);
    }

    // Calculate risk if stopLoss is available
    const riskInput = calculateRisk(
        position.entryPrice,
        position.stopLoss,
        position.tradeSide
    );

    return {
        userId,
        journalId,
        assetId,
        sessionId,
        tradeDate: new Date(position.openTimestamp),
        riskInput, // Calculated from SL

        // Map profitLossAmount directly from cTrader data
        profitLossAmount: position.profitLoss.toString(),

        profitLossPercentage,
        exitReason: null,
        breakEvenThreshold: "0.1",
        tradingviewLink: null,
        notes: `cTrader Position - ${position.symbol}${position.stopLoss ? ` | SL: ${position.stopLoss}` : ""}${position.takeProfit ? ` | TP: ${position.takeProfit}` : ""}`,
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
    sessionId: string | null
) {
    // Use balance at trade close time if available, otherwise use current account balance
    // closePositionDetail.balance is the balance AFTER the trade, so we subtract the profit to get balance BEFORE
    let capitalForCalculation = accountBalance;
    if (lastDeal.closePositionDetail?.balance) {
        // Balance after trade - profit = balance before trade
        capitalForCalculation =
            lastDeal.closePositionDetail.balance - netProfit;
    }

    // Calculate P&L percentage: (profit / capital) * 100
    const profitLossPercentage =
        capitalForCalculation > 0
            ? ((netProfit / capitalForCalculation) * 100).toFixed(2)
            : "0";

    // Detect exit reason based on P&L percentage
    // Thresholds: BE = -0.10% to +1%, TP = >+1%, SL = <-0.10%
    const BE_THRESHOLD_LOW = -0.1;
    const BE_THRESHOLD_HIGH = 1;
    const pnlPct = Number.parseFloat(profitLossPercentage);

    let exitReason: string | null = null;
    if (isClosed) {
        if (pnlPct > BE_THRESHOLD_HIGH) {
            exitReason = "TP"; // Take Profit (win)
        } else if (pnlPct < BE_THRESHOLD_LOW) {
            exitReason = "SL"; // Stop Loss (loss)
        } else {
            exitReason = "BE"; // Break Even
        }
    }

    return {
        userId,
        journalId,
        assetId, // Auto-created asset
        sessionId,
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
    journalId: string
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
                    eq(advancedTrades.isClosed, false)
                )
            );

        let closedCount = 0;

        for (const trade of openTrades) {
            // If trade's externalId is not in current positions, close it
            // BUT: If we are also syncing history, the history sync might have already closed it correctly with real P&L!
            // We should checks if it was updated recently by history sync?
            // For now, naive closure: if not in open list => closed.
            // But we don't know the P&L. So we set P&L to 0 or keep last known?

            if (
                trade.externalId &&
                !currentPositionIds.includes(trade.externalId)
            ) {
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
