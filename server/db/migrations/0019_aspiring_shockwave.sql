ALTER TABLE "altiora_advanced_trade" RENAME TO "advanced_trade";--> statement-breakpoint
ALTER TABLE "altiora_goal" RENAME TO "goal";--> statement-breakpoint
ALTER TABLE "altiora_goal_reminder" RENAME TO "goal_reminder";--> statement-breakpoint
ALTER TABLE "altiora_goal_task" RENAME TO "goal_task";--> statement-breakpoint
ALTER TABLE "altiora_habit" RENAME TO "habit";--> statement-breakpoint
ALTER TABLE "altiora_habit_completion" RENAME TO "habit_completion";--> statement-breakpoint
ALTER TABLE "altiora_discord_pomodoro_session" RENAME TO "discord_pomodoro_session";--> statement-breakpoint
ALTER TABLE "altiora_sub_goal" RENAME TO "sub_goal";--> statement-breakpoint
ALTER TABLE "altiora_trade" RENAME TO "trade";--> statement-breakpoint
ALTER TABLE "altiora_trading_asset" RENAME TO "trading_asset";--> statement-breakpoint
ALTER TABLE "altiora_trading_journal" RENAME TO "trading_journal";--> statement-breakpoint
ALTER TABLE "altiora_trading_session" RENAME TO "trading_session";--> statement-breakpoint
ALTER TABLE "altiora_trading_setup" RENAME TO "trading_setup";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_provider_account_unique";--> statement-breakpoint
ALTER TABLE "advanced_trade" DROP CONSTRAINT "altiora_advanced_trade_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "advanced_trade" DROP CONSTRAINT "altiora_advanced_trade_journal_id_altiora_trading_journal_id_fk";
--> statement-breakpoint
ALTER TABLE "advanced_trade" DROP CONSTRAINT "altiora_advanced_trade_asset_id_altiora_trading_asset_id_fk";
--> statement-breakpoint
ALTER TABLE "advanced_trade" DROP CONSTRAINT "altiora_advanced_trade_session_id_altiora_trading_session_id_fk";
--> statement-breakpoint
ALTER TABLE "advanced_trade" DROP CONSTRAINT "altiora_advanced_trade_setup_id_altiora_trading_setup_id_fk";
--> statement-breakpoint
ALTER TABLE "discord_pomodoro_session" DROP CONSTRAINT "altiora_discord_pomodoro_session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "goal_reminder" DROP CONSTRAINT "altiora_goal_reminder_goal_id_altiora_goal_id_fk";
--> statement-breakpoint
ALTER TABLE "goal_reminder" DROP CONSTRAINT "altiora_goal_reminder_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "goal_task" DROP CONSTRAINT "altiora_goal_task_goal_id_altiora_goal_id_fk";
--> statement-breakpoint
ALTER TABLE "goal_task" DROP CONSTRAINT "altiora_goal_task_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "goal" DROP CONSTRAINT "altiora_goal_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "habit_completion" DROP CONSTRAINT "altiora_habit_completion_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "habit_completion" DROP CONSTRAINT "altiora_habit_completion_habit_id_altiora_habit_id_fk";
--> statement-breakpoint
ALTER TABLE "habit" DROP CONSTRAINT "altiora_habit_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "sub_goal" DROP CONSTRAINT "altiora_sub_goal_goal_id_altiora_goal_id_fk";
--> statement-breakpoint
ALTER TABLE "sub_goal" DROP CONSTRAINT "altiora_sub_goal_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "trade" DROP CONSTRAINT "altiora_trade_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "trading_asset" DROP CONSTRAINT "altiora_trading_asset_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "trading_asset" DROP CONSTRAINT "altiora_trading_asset_journal_id_altiora_trading_journal_id_fk";
--> statement-breakpoint
ALTER TABLE "trading_journal" DROP CONSTRAINT "altiora_trading_journal_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "trading_session" DROP CONSTRAINT "altiora_trading_session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "trading_session" DROP CONSTRAINT "altiora_trading_session_journal_id_altiora_trading_journal_id_fk";
--> statement-breakpoint
ALTER TABLE "trading_setup" DROP CONSTRAINT "altiora_trading_setup_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "trading_setup" DROP CONSTRAINT "altiora_trading_setup_journal_id_altiora_trading_journal_id_fk";
--> statement-breakpoint
DROP INDEX "account_user_id_idx";--> statement-breakpoint
DROP INDEX "account_provider_account_idx";--> statement-breakpoint
DROP INDEX "session_user_id_idx";--> statement-breakpoint
DROP INDEX "session_token_idx";--> statement-breakpoint
DROP INDEX "user_email_idx";--> statement-breakpoint
DROP INDEX "user_stripe_customer_idx";--> statement-breakpoint
DROP INDEX "verification_identifier_idx";--> statement-breakpoint
DROP INDEX "verification_value_idx";--> statement-breakpoint
DROP INDEX "verification_expires_at_idx";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "account_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "provider_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "access_token" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "refresh_token" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "scope" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id_token" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "password" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "token" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "ip_address" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "user_agent" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "image" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email_verified" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email_verified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "identifier" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "value" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_journal_id_trading_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."trading_journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_asset_id_trading_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."trading_asset"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_session_id_trading_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."trading_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_setup_id_trading_setup_id_fk" FOREIGN KEY ("setup_id") REFERENCES "public"."trading_setup"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discord_pomodoro_session" ADD CONSTRAINT "discord_pomodoro_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_reminder" ADD CONSTRAINT "goal_reminder_goal_id_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_reminder" ADD CONSTRAINT "goal_reminder_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_task" ADD CONSTRAINT "goal_task_goal_id_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_task" ADD CONSTRAINT "goal_task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal" ADD CONSTRAINT "goal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_completion" ADD CONSTRAINT "habit_completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_completion" ADD CONSTRAINT "habit_completion_habit_id_habit_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit" ADD CONSTRAINT "habit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_goal" ADD CONSTRAINT "sub_goal_goal_id_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_goal" ADD CONSTRAINT "sub_goal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade" ADD CONSTRAINT "trade_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_asset" ADD CONSTRAINT "trading_asset_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_asset" ADD CONSTRAINT "trading_asset_journal_id_trading_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."trading_journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_journal" ADD CONSTRAINT "trading_journal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_session" ADD CONSTRAINT "trading_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_session" ADD CONSTRAINT "trading_session_journal_id_trading_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."trading_journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_setup" ADD CONSTRAINT "trading_setup_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_setup" ADD CONSTRAINT "trading_setup_journal_id_trading_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."trading_journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "rank";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "subscription_plan";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "is_leaderboard_public";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "discord_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "discord_username";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "discord_discriminator";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "discord_avatar";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "discord_connected";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "discord_role_synced";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "last_discord_sync";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "stripe_subscription_status";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "stripe_subscription_end_date";--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_token_unique" UNIQUE("token");