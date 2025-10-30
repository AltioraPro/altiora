import { sql } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { user } from "@/server/db/schema";
import { tradingJournals } from "../trading-journals/schema";

export const tradingSetups = pgTable(
    "trading_setup",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),
        journalId: varchar("journal_id", { length: 255 })
            .references(() => tradingJournals.id, { onDelete: "cascade" })
            .notNull(),

        name: varchar("name", { length: 100 }).notNull(),
        description: text("description"),
        strategy: text("strategy"),
        successRate: integer("success_rate"),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("trading_setup_user_id_idx").on(table.userId),
        index("trading_setup_journal_id_idx").on(table.journalId),
    ]
);
