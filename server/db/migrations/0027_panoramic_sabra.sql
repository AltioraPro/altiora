-- Convert trade_date from varchar(10) to timestamp with time zone
-- Handle the conversion using USING clause to parse the date string

------- FAIT MANUELLEMENT -------
ALTER TABLE "advanced_trade" 
ALTER COLUMN "trade_date" TYPE timestamp with time zone 
USING CASE 
  WHEN "trade_date" ~ '^\d{4}-\d{2}-\d{2}$' THEN 
    ("trade_date" || ' 00:00:00')::timestamp with time zone
  ELSE 
    CURRENT_TIMESTAMP
END;

-- Drop the symbol column if it exists (data loss warning acknowledged)
ALTER TABLE "advanced_trade" DROP COLUMN IF EXISTS "symbol";
--------------------------------

DROP INDEX "advanced_trade_symbol_idx";--> statement-breakpoint
DROP INDEX "trading_asset_symbol_idx";--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "trade_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "trade_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "risk_input" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "profit_loss_amount" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "profit_loss_percentage" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "exit_reason" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "break_even_threshold" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "break_even_threshold" SET DEFAULT '0.1';--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "tradingview_link" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "advanced_trade" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "trading_asset" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "trading_asset" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "advanced_trade" DROP COLUMN "symbol";--> statement-breakpoint
ALTER TABLE "trading_asset" DROP COLUMN "symbol";