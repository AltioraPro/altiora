ALTER TABLE "user" ADD COLUMN "rank" varchar(50) DEFAULT 'NEW' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_plan" varchar(20) DEFAULT 'FREE' NOT NULL;