-- Script pour ajouter les colonnes Discord à la table user
-- Exécutez ce script directement dans votre base de données Neon

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "discord_id" varchar(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "discord_username" varchar(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "discord_discriminator" varchar(10);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "discord_avatar" varchar(1024);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "discord_connected" boolean DEFAULT false NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "discord_role_synced" boolean DEFAULT false NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "last_discord_sync" timestamp with time zone; 