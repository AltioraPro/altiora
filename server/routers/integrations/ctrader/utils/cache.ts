import redis from "@/lib/redis";

/**
 * Cache service for cTrader sync operations
 * Prevents excessive API calls with 5-minute TTL
 */

const CACHE_PREFIX = "ctrader:sync:";
const CACHE_TTL_SECONDS = 300; // 5 minutes

export interface CachedSyncResult {
	positions: unknown[];
	syncedAt: string;
	count: number;
}

export class CTraderSyncCache {
	/**
	 * Get cached sync result for a journal
	 */
	static async get(journalId: string): Promise<CachedSyncResult | null> {
		try {
			const key = `${CACHE_PREFIX}${journalId}`;
			const cached = await redis.get(key);

			if (!cached) return null;

			return JSON.parse(cached) as CachedSyncResult;
		} catch (error) {
			console.error("CTrader cache get error:", error);
			return null;
		}
	}

	/**
	 * Set cached sync result for a journal
	 */
	static async set(
		journalId: string,
		positions: unknown[],
	): Promise<void> {
		try {
			const key = `${CACHE_PREFIX}${journalId}`;
			const data: CachedSyncResult = {
				positions,
				syncedAt: new Date().toISOString(),
				count: positions.length,
			};

			await redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(data));
		} catch (error) {
			console.error("CTrader cache set error:", error);
			// Don't throw - caching is optional
		}
	}

	/**
	 * Invalidate cache for a journal (force refresh)
	 */
	static async invalidate(journalId: string): Promise<void> {
		try {
			const key = `${CACHE_PREFIX}${journalId}`;
			await redis.del(key);
		} catch (error) {
			console.error("CTrader cache invalidate error:", error);
		}
	}

	/**
	 * Clear all cTrader caches
	 */
	static async clearAll(): Promise<void> {
		try {
			const keys = await redis.keys(`${CACHE_PREFIX}*`);
			if (keys.length > 0) {
				await redis.del(...keys);
			}
		} catch (error) {
			console.error("CTrader cache clear all error:", error);
		}
	}
}
