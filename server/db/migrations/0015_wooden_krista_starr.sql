ALTER TABLE "account" ALTER COLUMN "access_token" SET DATA TYPE varchar(4096);--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "refresh_token" SET DATA TYPE varchar(4096);--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "scope" SET DATA TYPE varchar(4096);--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id_token" SET DATA TYPE varchar(4096);