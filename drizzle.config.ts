import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "./env";

export default defineConfig({
    schema: "./server/db/schema/index.ts",
    out: "./server/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
});
