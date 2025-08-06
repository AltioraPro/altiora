CREATE TABLE "altiora_advanced_trade" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"journal_id" varchar(255) NOT NULL,
	"asset_id" varchar(255),
	"session_id" varchar(255),
	"setup_id" varchar(255),
	"trade_date" varchar(10) NOT NULL,
	"symbol" varchar(50) NOT NULL,
	"risk_input" varchar(50),
	"position_size" varchar(50),
	"stop_loss" varchar(50),
	"take_profit" varchar(50),
	"profit_loss_amount" varchar(50),
	"profit_loss_percentage" varchar(50),
	"exit_reason" varchar(100),
	"tradingview_link" varchar(1024),
	"notes" text,
	"tags" text,
	"rating" integer,
	"is_closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "altiora_trading_asset" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"journal_id" varchar(255) NOT NULL,
	"name" varchar(50) NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"type" varchar(20) DEFAULT 'forex',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "altiora_trading_journal" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "altiora_trading_session" (
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
CREATE TABLE "altiora_trading_setup" (
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
ALTER TABLE "altiora_advanced_trade" ADD CONSTRAINT "altiora_advanced_trade_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_advanced_trade" ADD CONSTRAINT "altiora_advanced_trade_journal_id_altiora_trading_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."altiora_trading_journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_advanced_trade" ADD CONSTRAINT "altiora_advanced_trade_asset_id_altiora_trading_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."altiora_trading_asset"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_advanced_trade" ADD CONSTRAINT "altiora_advanced_trade_session_id_altiora_trading_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."altiora_trading_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_advanced_trade" ADD CONSTRAINT "altiora_advanced_trade_setup_id_altiora_trading_setup_id_fk" FOREIGN KEY ("setup_id") REFERENCES "public"."altiora_trading_setup"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_trading_asset" ADD CONSTRAINT "altiora_trading_asset_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_trading_asset" ADD CONSTRAINT "altiora_trading_asset_journal_id_altiora_trading_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."altiora_trading_journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_trading_journal" ADD CONSTRAINT "altiora_trading_journal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_trading_session" ADD CONSTRAINT "altiora_trading_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_trading_session" ADD CONSTRAINT "altiora_trading_session_journal_id_altiora_trading_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."altiora_trading_journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_trading_setup" ADD CONSTRAINT "altiora_trading_setup_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_trading_setup" ADD CONSTRAINT "altiora_trading_setup_journal_id_altiora_trading_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."altiora_trading_journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "advanced_trade_user_id_idx" ON "altiora_advanced_trade" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "advanced_trade_journal_id_idx" ON "altiora_advanced_trade" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX "advanced_trade_asset_id_idx" ON "altiora_advanced_trade" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "advanced_trade_session_id_idx" ON "altiora_advanced_trade" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "advanced_trade_setup_id_idx" ON "altiora_advanced_trade" USING btree ("setup_id");--> statement-breakpoint
CREATE INDEX "advanced_trade_date_idx" ON "altiora_advanced_trade" USING btree ("trade_date");--> statement-breakpoint
CREATE INDEX "advanced_trade_symbol_idx" ON "altiora_advanced_trade" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "trading_asset_user_id_idx" ON "altiora_trading_asset" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trading_asset_journal_id_idx" ON "altiora_trading_asset" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX "trading_asset_symbol_idx" ON "altiora_trading_asset" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "trading_journal_user_id_idx" ON "altiora_trading_journal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trading_journal_active_idx" ON "altiora_trading_journal" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "trading_session_user_id_idx" ON "altiora_trading_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trading_session_journal_id_idx" ON "altiora_trading_session" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX "trading_setup_user_id_idx" ON "altiora_trading_setup" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trading_setup_journal_id_idx" ON "altiora_trading_setup" USING btree ("journal_id");