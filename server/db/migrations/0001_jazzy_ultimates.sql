CREATE TABLE "altiora_habit_completion" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"habit_id" varchar(255) NOT NULL,
	"completion_date" varchar(10) NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "access_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "refresh_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "id_token" varchar(1024);--> statement-breakpoint
ALTER TABLE "altiora_habit" ADD COLUMN "emoji" varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE "altiora_habit" ADD COLUMN "color" varchar(7) DEFAULT '#ffffff';--> statement-breakpoint
ALTER TABLE "altiora_habit" ADD COLUMN "target_frequency" varchar(20) DEFAULT 'daily';--> statement-breakpoint
ALTER TABLE "altiora_habit" ADD COLUMN "sort_order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "token" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "ip_address" varchar(45);--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "user_agent" varchar(1024);--> statement-breakpoint
ALTER TABLE "altiora_habit_completion" ADD CONSTRAINT "altiora_habit_completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_habit_completion" ADD CONSTRAINT "altiora_habit_completion_habit_id_altiora_habit_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."altiora_habit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "habit_completion_user_id_idx" ON "altiora_habit_completion" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "habit_completion_habit_id_idx" ON "altiora_habit_completion" USING btree ("habit_id");--> statement-breakpoint
CREATE INDEX "habit_completion_date_idx" ON "altiora_habit_completion" USING btree ("completion_date");--> statement-breakpoint
CREATE INDEX "habit_completion_unique_idx" ON "altiora_habit_completion" USING btree ("user_id","habit_id","completion_date");--> statement-breakpoint
CREATE INDEX "account_provider_account_idx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "habit_active_idx" ON "altiora_habit" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "expires_at";