import type { InferSelectModel } from "drizzle-orm";
import {
    boolean,
    index,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { tradingJournals, user } from "@/server/db/schema";

/**
 * Broker connections table - stores integration info for trading brokers
 * Supports: cTrader (direct), MetaTrader (via EA webhook), and manual entry
 */
export const brokerConnections = pgTable(
    "broker_connection",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),

        journalId: varchar("journal_id", { length: 255 })
            .references(() => tradingJournals.id, { onDelete: "cascade" })
            .notNull()
            .unique(), // 1 journal = 1 broker connection max

        // Provider identification
        provider: varchar("provider", { length: 50 }).notNull(),
        // "ctrader" | "metatrader" | "manual"

        brokerName: varchar("broker_name", { length: 100 }),
        // e.g., "Pepperstone", "ICMarkets", "FP Markets"

        // === cTrader Direct Integration ===
        brokerAccountId: varchar("broker_account_id", { length: 255 }),
        // cTrader account ID from OAuth

        accountNumber: varchar("account_number", { length: 100 }),
        // Display account number

        platform: varchar("platform", { length: 10 }),
        // "mt4" | "mt5" (for MetaTrader only)

        // === MetaTrader Webhook Integration ===
        webhookToken: varchar("webhook_token", { length: 64 }),
        // Unique token for EA authentication (generated when setting up MT connection)

        // === Common Fields ===
        accountType: varchar("account_type", { length: 20 }),
        // "live" | "demo"

        currency: varchar("currency", { length: 10 }),
        // Account currency (USD, EUR, etc.)

        isActive: boolean("is_active").default(true).notNull(),
        // Connection active/paused

        // Sync status
        lastSyncedAt: timestamp("last_synced_at"),
        lastSyncStatus: varchar("last_sync_status", { length: 20 }),
        // "success" | "error" | "pending"

        lastSyncError: text("last_sync_error"),
        syncCount: varchar("sync_count", { length: 10 }).default("0"),
        // Total successful syncs

        // Metadata
        metadata: text("metadata"), // JSON for additional provider-specific data

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("broker_connection_user_id_idx").on(table.userId),
        index("broker_connection_journal_id_idx").on(table.journalId),
        index("broker_connection_provider_idx").on(table.provider),
        index("broker_connection_active_idx").on(table.isActive),
        index("broker_connection_webhook_token_idx").on(table.webhookToken),
    ]
);

export type BrokerConnection = InferSelectModel<typeof brokerConnections>;

/**
 * Provider type for broker connections
 */
export type BrokerProvider = "ctrader" | "metatrader" | "manual";

/**
 * Account type for broker connections
 */
export type AccountType = "live" | "demo";

/**
 * Sync status for broker connections
 */
export type SyncStatus = "success" | "error" | "pending";
