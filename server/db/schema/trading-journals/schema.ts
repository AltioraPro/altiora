import { type InferSelectModel, sql } from "drizzle-orm";
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

export const tradingJournals = pgTable(
    "trading_journal",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),

        name: varchar("name", { length: 255 }).notNull(),
        description: text("description"),
        isActive: boolean("is_active").default(true).notNull(),
        order: integer("order").default(0).notNull(),
        startingCapital: varchar("starting_capital", { length: 50 }),
        usePercentageCalculation: boolean("use_percentage_calculation")
            .default(false)
            .notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("trading_journal_user_id_idx").on(table.userId),
        index("trading_journal_active_idx").on(table.isActive),
    ]
);

export type TradingJournal = InferSelectModel<typeof tradingJournals>;
