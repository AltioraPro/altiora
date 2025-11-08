import {
    boolean,
    index,
    pgTable,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { user } from "@/server/db/schema";
import { tradingJournals } from "../trading-journals/schema";

export const tradingAssets = pgTable(
    "trading_asset",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),
        journalId: varchar("journal_id", { length: 255 })
            .references(() => tradingJournals.id, { onDelete: "cascade" })
            .notNull(),

        name: varchar("name", { length: 50 }).notNull(),
        type: varchar("type", { length: 20 }).default("forex"),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("trading_asset_user_id_idx").on(table.userId),
        index("trading_asset_journal_id_idx").on(table.journalId),
    ]
);
