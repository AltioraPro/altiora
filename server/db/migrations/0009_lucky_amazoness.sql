ALTER TABLE "subscription_plan" ADD COLUMN "max_monthly_goals" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plan" DROP COLUMN "max_custom_goals";