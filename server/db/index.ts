import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { config } from "dotenv";

// Charger les variables d'environnement
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export * from "./schema";

// import { Redis } from "@upstash/redis";

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });

// export { redis };

// Fonction utilitaire pour le cache (version mockée sans Redis)
export const cacheUtils = {
  async get<T>(): Promise<T | null> {
    // Mock implementation - retourne null pour simuler l'absence de cache
    return null;
  },

  async set(): Promise<void> {
    // Mock implementation - ne fait rien
  },

  async invalidate(): Promise<void> {
    // Mock implementation - ne fait rien
  },

  generateKey(prefix: string, userId: string, ...params: string[]): string {
    return `${prefix}:${userId}:${params.join(":")}`;
  }
}; 