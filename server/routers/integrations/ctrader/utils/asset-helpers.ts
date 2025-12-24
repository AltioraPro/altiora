import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import type { Database } from "@/server/db";
import { tradingAssets, tradingJournals } from "@/server/db/schema";

/**
 * Get or create an asset for a given symbol
 * @param db Database instance
 * @param symbol Symbol name (e.g., "EURUSD", "GBPUSD")
 * @param journalId Journal ID
 * @param userId User ID
 * @returns Asset ID
 */
export async function getOrCreateAsset(
	db: Database,
	symbol: string,
	journalId: string,
	userId: string,
): Promise<string> {
	// Check if asset already exists
	const existingAssets = await db
		.select()
		.from(tradingAssets)
		.where(
			and(
				eq(tradingAssets.name, symbol),
				eq(tradingAssets.journalId, journalId),
			)
		)
		.limit(1);

	if (existingAssets.length > 0) {
		return existingAssets[0].id;
	}

	// Create new asset
	const assetId = nanoid();
	await db.insert(tradingAssets).values({
		id: assetId,
		userId,
		journalId,
		name: symbol,
		type: "forex", // Assume forex for now
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	console.log(`[Asset] Created new asset: ${symbol} (${assetId})`);
	return assetId;
}

/**
 * Update journal capital based on broker account balance
 * @param db Database instance
 * @param journalId Journal ID
 * @param balance Account balance from broker
 */
export async function updateJournalCapital(
	db: Database,
	journalId: string,
	balance: number,
): Promise<void> {
	await db
		.update(tradingJournals)
		.set({
			currentCapital: balance.toString(),
			updatedAt: new Date(),
		})
		.where(eq(tradingJournals.id, journalId));

	console.log(`[Capital] Updated journal ${journalId} capital to ${balance}€`);
}

/**
 * Map cTrader symbolId to human-readable symbol name
 * TODO: This should fetch from cTrader API, but for now use a hardcoded map
 * Common cTrader symbolIds:
 * 1 = EURUSD, 2 = GBPUSD, 3 = GBPJPY, etc.
 */
export function mapSymbolIdToName(symbolId: string): string {
	const symbolMap: Record<string, string> = {
		"1": "EURUSD",
		"2": "GBPUSD",
		"3": "GBPJPY",
		"4": "EURJPY",
		"5": "USDJPY",
		"6": "USDCHF",
		"7": "USDCAD",
		"8": "AUDUSD",
		"9": "NZDUSD",
		"10": "EURGBP",
		"11": "EURAUD",
		"12": "EURCHF",
		"13": "AUDJPY",
		"14": "CADJPY",
		"15": "CHFJPY",
		"16": "AUDCAD",
		"17": "AUDCHF",
		"18": "AUDNZD",
		"19": "CADCHF",
		"20": "EURCAD",
		"21": "EURNZD",
		"22": "GBPAUD",
		"23": "GBPCAD",
		"24": "GBPCHF",
		"25": "GBPNZD",
		"26": "NZDCAD",
		"27": "NZDCHF",
		"28": "NZDJPY",
	};

	return symbolMap[symbolId] || `SYMBOL_${symbolId}`;
}
