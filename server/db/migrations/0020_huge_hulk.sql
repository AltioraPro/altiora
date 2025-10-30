ALTER TABLE "user" ADD COLUMN "rank" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_plan" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_leaderboard_public" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_discriminator" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_avatar" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_connected" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_role_synced" boolean;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_discord_sync" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_subscription_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_subscription_status" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_subscription_end_date" text;