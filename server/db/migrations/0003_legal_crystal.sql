ALTER TABLE "user" ADD COLUMN "stripe_customer_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_subscription_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_subscription_status" varchar(50);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_subscription_end_date" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "user_stripe_customer_idx" ON "user" USING btree ("stripe_customer_id");