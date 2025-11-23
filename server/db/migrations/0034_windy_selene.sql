
-- Migrate existing confirmation_id data from advanced_trade to trades_confirmation junction table
-- This migration converts the one-to-many relationship to a many-to-many relationship

-- Step 1: Insert existing confirmation relationships into the junction table
-- Only insert rows where confirmation_id is not null
INSERT INTO "trades_confirmation" (
    "id",
    "user_id",
    "advanced_trade_id",
    "confirmation_id",
    "created_at",
    "updated_at"
)
SELECT
    gen_random_uuid()::text AS "id",
    "user_id" AS "user_id",
    "id" AS "advanced_trade_id",
    "confirmation_id" AS "confirmation_id",
    COALESCE("created_at", CURRENT_TIMESTAMP) AS "created_at",
    COALESCE("updated_at", CURRENT_TIMESTAMP) AS "updated_at"
FROM "advanced_trade"
WHERE "confirmation_id" IS NOT NULL;
--> statement-breakpoint

ALTER TABLE "advanced_trade" DROP CONSTRAINT "advanced_trade_confirmation_id_confirmation_id_fk";
--> statement-breakpoint
DROP INDEX "advanced_trade_confirmation_id_idx";--> statement-breakpoint
ALTER TABLE "advanced_trade" DROP COLUMN "confirmation_id";




