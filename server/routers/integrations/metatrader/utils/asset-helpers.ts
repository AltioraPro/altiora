import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import type { Database } from "@/server/db";
import { tradingAssets } from "@/server/db/schema";

/**
 * Get or create an asset for a given symbol in a journal
 * @param db Database instance
 * @param symbol Symbol name (e.g., "EURUSD", "XAUUSD")
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
	
	try {
		await db.insert(tradingAssets).values({
			id: assetId,
			userId,
			journalId,
			name: symbol,
			type: guessAssetType(symbol),
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		console.log(`[MT Asset] Created new asset: ${symbol} (${assetId})`);
		return assetId;
	} catch (error) {
		// If insert fails (e.g., race condition), try to fetch again
		const retryAssets = await db
			.select()
			.from(tradingAssets)
			.where(
				and(
					eq(tradingAssets.name, symbol),
					eq(tradingAssets.journalId, journalId),
				)
			)
			.limit(1);

		if (retryAssets.length > 0) {
			return retryAssets[0].id;
		}

		// If still not found, throw the original error
		throw error;
	}
}

/**
 * Guess asset type from symbol name
 * @param symbol Trading symbol
 * @returns Asset type string
 */
export function guessAssetType(symbol: string): string {
	const s = symbol.toUpperCase();

	// Forex pairs (typically 6 characters, both currencies)
	if (s.length === 6 && /^[A-Z]{6}$/.test(s)) {
		return "forex";
	}

	// Gold/Silver (commodities)
	if (s.includes("XAU") || s.includes("GOLD")) return "commodity";
	if (s.includes("XAG") || s.includes("SILVER")) return "commodity";

	// Oil
	if (s.includes("WTI") || s.includes("BRENT") || s.includes("OIL") || s.includes("CL")) {
		return "commodity";
	}

	// Major indices
	if (
		s.includes("US30") ||
		s.includes("NAS") ||
		s.includes("SPX") ||
		s.includes("SP500") ||
		s.includes("DAX") ||
		s.includes("UK100") ||
		s.includes("FTSE") ||
		s.includes("US500")
	) {
		return "index";
	}

	// Crypto
	if (
		s.includes("BTC") ||
		s.includes("ETH") ||
		s.includes("XRP") ||
		s.includes("LTC") ||
		s.includes("DOGE")
	) {
		return "crypto";
	}

	// Stocks (usually end with .US or similar, or are longer symbols)
	if (s.includes(".") || s.length > 6) {
		return "stock";
	}

	return "other";
}
