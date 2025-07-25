ALTER TABLE "user" ADD COLUMN "discord_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_username" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_discriminator" varchar(10);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_avatar" varchar(1024);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_connected" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_role_synced" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_discord_sync" timestamp with time zone;