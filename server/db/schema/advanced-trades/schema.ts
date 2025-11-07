import { type InferSelectModel, sql } from "drizzle-orm";
import {
    boolean,
    index,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import {
    tradingAssets,
    tradingJournals,
    tradingSessions,
    tradingSetups,
    user,
} from "@/server/db/schema";

export const advancedTrades = pgTable(
    "advanced_trade",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),
        journalId: varchar("journal_id", { length: 255 })
            .references(() => tradingJournals.id, { onDelete: "cascade" })
            .notNull(),
        assetId: varchar("asset_id", { length: 255 }).references(
            () => tradingAssets.id,
            { onDelete: "set null" }
        ),
        sessionId: varchar("session_id", { length: 255 }).references(
            () => tradingSessions.id,
            { onDelete: "set null" }
        ),
        setupId: varchar("setup_id", { length: 255 }).references(
            () => tradingSetups.id,
            { onDelete: "set null" }
        ),
        tradeDate: varchar("trade_date", { length: 10 }).notNull(),
        symbol: varchar("symbol", { length: 50 }).notNull(),
        riskInput: varchar("risk_input", { length: 50 }),
        profitLossAmount: varchar("profit_loss_amount", { length: 50 }),
        profitLossPercentage: varchar("profit_loss_percentage", { length: 50 }),
        exitReason: varchar("exit_reason", { length: 20 }),
        breakEvenThreshold: varchar("break_even_threshold", {
            length: 10,
        }).default("0.1"),
        tradingviewLink: varchar("tradingview_link", { length: 1024 }),
        notes: text("notes"),
        isClosed: boolean("is_closed").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("advanced_trade_user_id_idx").on(table.userId),
        index("advanced_trade_journal_id_idx").on(table.journalId),
        index("advanced_trade_asset_id_idx").on(table.assetId),
        index("advanced_trade_session_id_idx").on(table.sessionId),
        index("advanced_trade_setup_id_idx").on(table.setupId),
        index("advanced_trade_date_idx").on(table.tradeDate),
        index("advanced_trade_symbol_idx").on(table.symbol),
    ]
);

export type AdvancedTrade = InferSelectModel<typeof advancedTrades>;
