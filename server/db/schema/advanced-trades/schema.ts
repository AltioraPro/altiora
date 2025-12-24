import type { InferSelectModel } from "drizzle-orm";
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
        tradeDate: timestamp("trade_date", { withTimezone: true })
            .defaultNow()
            .notNull(),
        riskInput: text("risk_input"),
        profitLossAmount: text("profit_loss_amount"),
        profitLossPercentage: text("profit_loss_percentage"),
        exitReason: text("exit_reason"),
        breakEvenThreshold: text("break_even_threshold").default("0.1"),
        tradingviewLink: text("tradingview_link"),
        notes: text("notes"),
        isClosed: boolean("is_closed").default(false).notNull(),
        
        // === Multi-Broker Integration Fields ===
        source: varchar("source", { length: 50 }).default("manual").notNull(),
        // "manual" | "ctrader" | "metatrader"
        
        externalId: varchar("external_id", { length: 255 }),
        // External broker ID: ticket (MT) or positionId (cTrader)
        
        externalAccountId: varchar("external_account_id", { length: 255 }),
        // Broker account ID for reference
        
        syncStatus: varchar("sync_status", { length: 20 }).default("synced"),
        // "synced" | "pending" | "error" | "conflict"
        
        lastSyncedAt: timestamp("last_synced_at"),
        // Last successful sync timestamp
        
        syncMetadata: text("sync_metadata"),
        // JSON metadata: commission, swap, broker-specific data
        
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [
        index("advanced_trade_user_id_idx").on(table.userId),
        index("advanced_trade_journal_id_idx").on(table.journalId),
        index("advanced_trade_asset_id_idx").on(table.assetId),
        index("advanced_trade_session_id_idx").on(table.sessionId),
        index("advanced_trade_date_idx").on(table.tradeDate),
        index("advanced_trade_source_idx").on(table.source),
        index("advanced_trade_external_id_idx").on(table.externalId),
    ]
);

export type AdvancedTrade = InferSelectModel<typeof advancedTrades>;
