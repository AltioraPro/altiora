ALTER TABLE "altiora_advanced_trade" ALTER COLUMN "exit_reason" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "altiora_advanced_trade" ADD COLUMN "break_even_threshold" varchar(10) DEFAULT '0.1';--> statement-breakpoint
ALTER TABLE "altiora_trading_journal" ADD COLUMN "starting_capital" varchar(50);--> statement-breakpoint
ALTER TABLE "altiora_trading_journal" ADD COLUMN "use_percentage_calculation" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "altiora_advanced_trade" DROP COLUMN "position_size";--> statement-breakpoint
ALTER TABLE "altiora_advanced_trade" DROP COLUMN "stop_loss";--> statement-breakpoint
ALTER TABLE "altiora_advanced_trade" DROP COLUMN "take_profit";--> statement-breakpoint
ALTER TABLE "altiora_advanced_trade" DROP COLUMN "tags";--> statement-breakpoint
ALTER TABLE "altiora_advanced_trade" DROP COLUMN "rating";