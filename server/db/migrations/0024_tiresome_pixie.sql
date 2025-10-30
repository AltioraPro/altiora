CREATE TABLE "discord_profile" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"discord_id" varchar(255) NOT NULL,
	"discord_username" varchar(255) NOT NULL,
	"discord_discriminator" varchar(10) NOT NULL,
	"discord_avatar" varchar(1024) NOT NULL,
	"discord_connected" boolean NOT NULL,
	"discord_role_synced" boolean,
	"last_discord_sync" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "discord_profile" ADD CONSTRAINT "discord_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;