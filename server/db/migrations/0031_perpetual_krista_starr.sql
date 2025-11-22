ALTER TABLE "trading_asset" RENAME TO "asset";--> statement-breakpoint
ALTER TABLE "trading_journal" RENAME TO "journal";--> statement-breakpoint
ALTER TABLE "trading_setup" RENAME TO "setup";--> statement-breakpoint
ALTER TABLE "journal" DROP CONSTRAINT "trading_journal_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "asset" DROP CONSTRAINT "trading_asset_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "asset" DROP CONSTRAINT "trading_asset_journal_id_trading_journal_id_fk";
--> statement-breakpoint
ALTER TABLE "trading_session" DROP CONSTRAINT "trading_session_journal_id_trading_journal_id_fk";
--> statement-breakpoint
ALTER TABLE "setup" DROP CONSTRAINT "trading_setup_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "setup" DROP CONSTRAINT "trading_setup_journal_id_trading_journal_id_fk";
--> statement-breakpoint
ALTER TABLE "advanced_trade" DROP CONSTRAINT "advanced_trade_journal_id_trading_journal_id_fk";
--> statement-breakpoint
ALTER TABLE "advanced_trade" DROP CONSTRAINT "advanced_trade_asset_id_trading_asset_id_fk";
--> statement-breakpoint
ALTER TABLE "advanced_trade" DROP CONSTRAINT "advanced_trade_setup_id_trading_setup_id_fk";
--> statement-breakpoint
DROP INDEX "trading_journal_user_id_idx";--> statement-breakpoint
DROP INDEX "trading_journal_active_idx";--> statement-breakpoint
DROP INDEX "trading_asset_user_id_idx";--> statement-breakpoint
DROP INDEX "trading_asset_journal_id_idx";--> statement-breakpoint
DROP INDEX "trading_setup_user_id_idx";--> statement-breakpoint
DROP INDEX "trading_setup_journal_id_idx";--> statement-breakpoint
ALTER TABLE "journal" ADD CONSTRAINT "journal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_journal_id_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_session" ADD CONSTRAINT "trading_session_journal_id_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setup" ADD CONSTRAINT "setup_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setup" ADD CONSTRAINT "setup_journal_id_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_journal_id_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_setup_id_setup_id_fk" FOREIGN KEY ("setup_id") REFERENCES "public"."setup"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "journal_user_id_idx" ON "journal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "journal_active_idx" ON "journal" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "asset_user_id_idx" ON "asset" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "asset_journal_id_idx" ON "asset" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX "setup_user_id_idx" ON "setup" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "setup_journal_id_idx" ON "setup" USING btree ("journal_id");