import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema });

export * from "./schema";

import { Redis } from "ioredis";

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

export { redis };

export const cacheUtils = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;

    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn("Redis get error:", error);
      return null;
    }
  },

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!redis) return;

    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.warn("Redis set error:", error);
    }
  },

  async invalidate(pattern: string): Promise<void> {
    if (!redis) return;

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.warn("Redis invalidate error:", error);
    }
  },

  generateKey(prefix: string, userId: string, ...params: string[]): string {
    return `${prefix}:${userId}:${params.join(":")}`;
  },

  async getStats<T>(
    userId: string,
    type: string,
    params: Record<string, any> = {}
  ): Promise<T | null> {
    const key = this.generateKey("stats", userId, type, JSON.stringify(params));
    return this.get<T>(key);
  },

  async setStats<T>(
    userId: string,
    type: string,
    data: T,
    params: Record<string, any> = {},
    ttlSeconds: number = 300
  ): Promise<void> {
    const key = this.generateKey("stats", userId, type, JSON.stringify(params));
    await this.set(key, data, ttlSeconds);
  },

  async invalidateUserStats(userId: string, type?: string): Promise<void> {
    const pattern = type ? `stats:${userId}:${type}:*` : `stats:${userId}:*`;
    await this.invalidate(pattern);
  },
};
