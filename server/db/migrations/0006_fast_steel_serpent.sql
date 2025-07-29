CREATE TABLE "monthly_usage" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"month" varchar(7) NOT NULL,
	"trading_entries_count" integer DEFAULT 0 NOT NULL,
	"habits_created_count" integer DEFAULT 0 NOT NULL,
	"goals_created_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plan" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"billing_interval" varchar(20) DEFAULT 'monthly' NOT NULL,
	"stripe_price_id" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"max_habits" integer DEFAULT 3 NOT NULL,
	"max_trading_entries" integer DEFAULT 10 NOT NULL,
	"max_annual_goals" integer DEFAULT 1 NOT NULL,
	"max_quarterly_goals" integer DEFAULT 1 NOT NULL,
	"max_custom_goals" integer DEFAULT 0 NOT NULL,
	"has_discord_integration" boolean DEFAULT false NOT NULL,
	"has_priority_support" boolean DEFAULT false NOT NULL,
	"has_early_access" boolean DEFAULT false NOT NULL,
	"has_monthly_challenges" boolean DEFAULT false NOT NULL,
	"has_premium_discord" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monthly_usage" ADD CONSTRAINT "monthly_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "monthly_usage_user_month_idx" ON "monthly_usage" USING btree ("user_id","month");