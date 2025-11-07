import { sql } from "drizzle-orm";
import {
    boolean,
    index,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { tradingJournals, user } from "@/server/db/schema";

export const tradingSessions = pgTable(
    "trading_session",
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
        startTime: varchar("start_time", { length: 5 }),
        endTime: varchar("end_time", { length: 5 }),
        timezone: varchar("timezone", { length: 50 }).default("UTC"),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("trading_session_user_id_idx").on(table.userId),
        index("trading_session_journal_id_idx").on(table.journalId),
    ]
);
