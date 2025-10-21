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

// Importer Redis seulement côté serveur (pas dans Edge Runtime)
let Redis: any;
let RedisHTTPClient: any;
let redisClient: any = null;

// Ne charger Redis que si on n'est pas dans Edge Runtime
if (typeof (globalThis as any).EdgeRuntime === "undefined") {
  try {
    Redis = require("ioredis").Redis;
    const { RedisHTTPClient: HTTPClient } = require("./redis-client");
    RedisHTTPClient = HTTPClient;

    // Utiliser ioredis en local, HTTP client en production serverless
    if (process.env.REDIS_API_URL && process.env.REDIS_API_KEY) {
      // Production serverless : utiliser l'API HTTP
      redisClient = new RedisHTTPClient(
        process.env.REDIS_API_URL,
        process.env.REDIS_API_KEY
      );
    } else if (process.env.REDIS_URL) {
      // Développement local : utiliser ioredis directement
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        enableOfflineQueue: false,
        connectTimeout: 10000,
        lazyConnect: true,
      });

      redisClient.connect().catch((err: any) => {
        console.warn("Redis connection failed:", err.message);
      });
    }
  } catch (error) {
    console.warn("Redis not available in this environment");
  }
}

// Créer une interface commune
const redis = redisClient
  ? {
      async get(key: string): Promise<string | null> {
        if (!redisClient) return null;
        if (redisClient instanceof Redis) {
          return await redisClient.get(key);
        } else {
          const result = await (redisClient as any).get(key);
          return result ? JSON.stringify(result) : null;
        }
      },
      async setex(key: string, ttl: number, value: string): Promise<void> {
        if (!redisClient) return;
        if (redisClient instanceof Redis) {
          await redisClient.setex(key, ttl, value);
        } else {
          await (redisClient as any).set(key, JSON.parse(value), ttl);
        }
      },
      async del(...keys: string[]): Promise<number> {
        if (!redisClient) return 0;
        if (redisClient instanceof Redis) {
          return await redisClient.del(...keys);
        } else {
          let count = 0;
          for (const key of keys) {
            count += await (redisClient as any).del(key);
          }
          return count;
        }
      },
      async keys(pattern: string): Promise<string[]> {
        if (!redisClient) return [];
        if (redisClient instanceof Redis) {
          return await redisClient.keys(pattern);
        } else {
          // Pour HTTP client, on retourne un tableau vide
          // car la suppression par pattern se fait directement
          return [];
        }
      },
    }
  : null;

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
      if (redisClient instanceof Redis) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else if (redisClient) {
        await (redisClient as any).del(pattern);
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
