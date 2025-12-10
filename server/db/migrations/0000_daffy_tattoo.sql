CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "advanced_trade" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"journal_id" varchar(255) NOT NULL,
	"asset_id" varchar(255),
	"session_id" varchar(255),
	"trade_date" timestamp with time zone DEFAULT now() NOT NULL,
	"risk_input" text,
	"profit_loss_amount" text,
	"profit_loss_percentage" text,
	"exit_reason" text,
	"break_even_threshold" text DEFAULT '0.1',
	"tradingview_link" text,
	"notes" text,
	"is_closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "asset" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"journal_id" varchar(255) NOT NULL,
	"name" varchar(50) NOT NULL,
	"type" varchar(20) DEFAULT 'forex',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "access_list" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"status" text NOT NULL,
	"added_by" text,
	"user_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "access_list_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "passkey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp,
	"aaguid" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"rank" text DEFAULT 'NEW' NOT NULL,
	"is_leaderboard_public" boolean DEFAULT false NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "confirmation" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"journal_id" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"strategy" text,
	"success_rate" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discord_profile" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"discord_id" varchar(255) NOT NULL,
	"discord_username" varchar(255) NOT NULL,
	"discord_discriminator" varchar(10) NOT NULL,
	"discord_avatar" varchar(1024) NOT NULL,
	"discord_connected" boolean NOT NULL,
	"discord_role_synced" boolean,
	"last_discord_sync" timestamp with time zone,
	"habit_reminders_enabled" boolean DEFAULT false NOT NULL,
	"last_habit_reminder_sent" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goal" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(20) NOT NULL,
	"goal_type" varchar(20) NOT NULL,
	"target_value" varchar(100),
	"current_value" varchar(100) DEFAULT '0',
	"unit" varchar(50),
	"deadline" timestamp with time zone,
	"is_completed" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"reminders_enabled" boolean DEFAULT false NOT NULL,
	"reminder_frequency" varchar(20),
	"last_reminder_sent" timestamp with time zone,
	"next_reminder_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goal_reminder" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"goal_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"reminder_type" varchar(20) NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	"status" varchar(20) DEFAULT 'sent',
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goal_task" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"goal_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" timestamp with time zone,
	"is_completed" boolean DEFAULT false NOT NULL,
	"priority" varchar(20) DEFAULT 'medium',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habit" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#ffffff',
	"target_frequency" varchar(20) DEFAULT 'daily',
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habit_completion" (
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
CREATE TABLE IF NOT EXISTS "journal" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"starting_capital" varchar(50),
	"use_percentage_calculation" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "monthly_usage" (
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
CREATE TABLE IF NOT EXISTS "discord_pomodoro_session" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"discord_id" varchar(255) NOT NULL,
	"channel_id" varchar(255) NOT NULL,
	"duration" integer NOT NULL,
	"work_time" integer NOT NULL,
	"break_time" integer NOT NULL,
	"format" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"current_phase" varchar(20) DEFAULT 'work' NOT NULL,
	"phase_start_time" timestamp with time zone,
	"total_work_time" integer DEFAULT 0 NOT NULL,
	"total_break_time" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sub_goal" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"goal_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trade" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"symbol" varchar(50) NOT NULL,
	"side" varchar(10) NOT NULL,
	"quantity" integer NOT NULL,
	"entry_price" varchar(20) NOT NULL,
	"exit_price" varchar(20),
	"reasoning" text NOT NULL,
	"pnl" varchar(20),
	"entry_time" timestamp with time zone NOT NULL,
	"exit_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trades_confirmation" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"advanced_trade_id" varchar(255) NOT NULL,
	"confirmation_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trading_session" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"journal_id" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"start_time" varchar(5),
	"end_time" varchar(5),
	"timezone" varchar(50) DEFAULT 'UTC',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_journal_id_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_session_id_trading_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."trading_session"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "asset" ADD CONSTRAINT "asset_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "asset" ADD CONSTRAINT "asset_journal_id_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "access_list" ADD CONSTRAINT "access_list_added_by_user_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "access_list" ADD CONSTRAINT "access_list_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "confirmation" ADD CONSTRAINT "confirmation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "confirmation" ADD CONSTRAINT "confirmation_journal_id_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discord_profile" ADD CONSTRAINT "discord_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal" ADD CONSTRAINT "goal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_reminder" ADD CONSTRAINT "goal_reminder_goal_id_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_reminder" ADD CONSTRAINT "goal_reminder_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_task" ADD CONSTRAINT "goal_task_goal_id_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_task" ADD CONSTRAINT "goal_task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit" ADD CONSTRAINT "habit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_completion" ADD CONSTRAINT "habit_completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_completion" ADD CONSTRAINT "habit_completion_habit_id_habit_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habit"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "journal" ADD CONSTRAINT "journal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monthly_usage" ADD CONSTRAINT "monthly_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discord_pomodoro_session" ADD CONSTRAINT "discord_pomodoro_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_goal" ADD CONSTRAINT "sub_goal_goal_id_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_goal" ADD CONSTRAINT "sub_goal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trade" ADD CONSTRAINT "trade_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades_confirmation" ADD CONSTRAINT "trades_confirmation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades_confirmation" ADD CONSTRAINT "trades_confirmation_advanced_trade_id_advanced_trade_id_fk" FOREIGN KEY ("advanced_trade_id") REFERENCES "public"."advanced_trade"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades_confirmation" ADD CONSTRAINT "trades_confirmation_confirmation_id_confirmation_id_fk" FOREIGN KEY ("confirmation_id") REFERENCES "public"."confirmation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trading_session" ADD CONSTRAINT "trading_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trading_session" ADD CONSTRAINT "trading_session_journal_id_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "advanced_trade_user_id_idx" ON "advanced_trade" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "advanced_trade_journal_id_idx" ON "advanced_trade" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "advanced_trade_asset_id_idx" ON "advanced_trade" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "advanced_trade_session_id_idx" ON "advanced_trade" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "advanced_trade_date_idx" ON "advanced_trade" USING btree ("trade_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_user_id_idx" ON "asset" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_journal_id_idx" ON "asset" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "passkey_userId_idx" ON "passkey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "passkey_credentialID_idx" ON "passkey" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "confirmation_user_id_idx" ON "confirmation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "confirmation_journal_id_idx" ON "confirmation" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_user_id_idx" ON "goal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_type_idx" ON "goal" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_active_idx" ON "goal" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_reminder_idx" ON "goal" USING btree ("reminders_enabled","next_reminder_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_reminder_goal_id_idx" ON "goal_reminder" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_reminder_user_id_idx" ON "goal_reminder" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_reminder_sent_at_idx" ON "goal_reminder" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_task_goal_id_idx" ON "goal_task" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_task_user_id_idx" ON "goal_task" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_task_due_date_idx" ON "goal_task" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "habit_user_id_idx" ON "habit" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "habit_active_idx" ON "habit" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "habit_completion_user_id_idx" ON "habit_completion" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "habit_completion_habit_id_idx" ON "habit_completion" USING btree ("habit_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "habit_completion_date_idx" ON "habit_completion" USING btree ("completion_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "habit_completion_unique_idx" ON "habit_completion" USING btree ("user_id","habit_id","completion_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "habit_completion_user_date_completed_idx" ON "habit_completion" USING btree ("user_id","completion_date","is_completed");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "habit_completion_user_habit_date_completed_idx" ON "habit_completion" USING btree ("user_id","habit_id","completion_date","is_completed");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_user_id_idx" ON "journal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_active_idx" ON "journal" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "monthly_usage_user_month_idx" ON "monthly_usage" USING btree ("user_id","month");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discord_pomodoro_user_id_idx" ON "discord_pomodoro_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discord_pomodoro_discord_id_idx" ON "discord_pomodoro_session" USING btree ("discord_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discord_pomodoro_status_idx" ON "discord_pomodoro_session" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discord_pomodoro_started_at_idx" ON "discord_pomodoro_session" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sub_goal_goal_id_idx" ON "sub_goal" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sub_goal_user_id_idx" ON "sub_goal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trade_user_id_idx" ON "trade" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trading_session_user_id_idx" ON "trading_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trading_session_journal_id_idx" ON "trading_session" USING btree ("journal_id");