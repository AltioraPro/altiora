ALTER TABLE "account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "access_token" SET DATA TYPE varchar(2048);--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "refresh_token" SET DATA TYPE varchar(2048);--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "scope" SET DATA TYPE varchar(2048);--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id_token" SET DATA TYPE varchar(2048);--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email_verified" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email_verified" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email_verified" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "altiora_trading_journal" DROP COLUMN "is_default";--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_provider_account_unique" UNIQUE("provider_id","account_id");