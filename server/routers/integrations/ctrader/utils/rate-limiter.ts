import redis from "@/lib/redis";

/**
 * Rate limiter for cTrader API requests
 * Prevents abuse and respects API limits
 */

const RATE_LIMIT_PREFIX = "ctrader:ratelimit:";
const MAX_REQUESTS_PER_MINUTE = 10;
const WINDOW_SECONDS = 60;

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}

export class CTraderRateLimiter {
    /**
     * Check if user is within rate limit
     * @param userId - User ID to check
     * @returns Rate limit result
     */
    static async checkLimit(userId: string): Promise<RateLimitResult> {
        try {
            const key = `${RATE_LIMIT_PREFIX}${userId}`;
            const now = Date.now();
            const windowStart = now - WINDOW_SECONDS * 1000;

            // Remove old entries outside the window
            await redis.zremrangebyscore(key, 0, windowStart);

            // Count requests in current window
            const count = await redis.zcard(key);

            if (count >= MAX_REQUESTS_PER_MINUTE) {
                // Get oldest request to calculate reset time
                const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
                const resetAt = oldest[1]
                    ? new Date(Number(oldest[1]) + WINDOW_SECONDS * 1000)
                    : new Date(now + WINDOW_SECONDS * 1000);

                return {
                    allowed: false,
                    remaining: 0,
                    resetAt,
                };
            }

            // Add current request
            await redis.zadd(key, now, `${now}`);
            await redis.expire(key, WINDOW_SECONDS);

            return {
                allowed: true,
                remaining: MAX_REQUESTS_PER_MINUTE - count - 1,
                resetAt: new Date(now + WINDOW_SECONDS * 1000),
            };
        } catch (error) {
            console.error("CTrader rate limit error:", error);
            // On error, allow request but log
            return {
                allowed: true,
                remaining: MAX_REQUESTS_PER_MINUTE - 1,
                resetAt: new Date(Date.now() + WINDOW_SECONDS * 1000),
            };
        }
    }

    /**
     * Reset rate limit for a user (admin only)
     */
    static async reset(userId: string): Promise<void> {
        try {
            const key = `${RATE_LIMIT_PREFIX}${userId}`;
            await redis.del(key);
        } catch (error) {
            console.error("CTrader rate limit reset error:", error);
        }
    }

    /**
     * Get current rate limit status
     */
    static async getStatus(userId: string): Promise<{
        count: number;
        remaining: number;
    }> {
        try {
            const key = `${RATE_LIMIT_PREFIX}${userId}`;
            const now = Date.now();
            const windowStart = now - WINDOW_SECONDS * 1000;

            await redis.zremrangebyscore(key, 0, windowStart);
            const count = await redis.zcard(key);

            return {
                count,
                remaining: Math.max(0, MAX_REQUESTS_PER_MINUTE - count),
            };
        } catch (error) {
            console.error("CTrader rate limit status error:", error);
            return {
                count: 0,
                remaining: MAX_REQUESTS_PER_MINUTE,
            };
        }
    }
}
