import { sql } from "drizzle-orm";
import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { user } from "../auth";

export const trades = pgTable(
    "trade",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),

        symbol: varchar("symbol", { length: 50 }).notNull(),
        side: varchar("side", { length: 10 }).notNull(),
        quantity: integer("quantity").notNull(),
        entryPrice: varchar("entry_price", { length: 20 }).notNull(),
        exitPrice: varchar("exit_price", { length: 20 }),
        reasoning: text("reasoning").notNull(),
        pnl: varchar("pnl", { length: 20 }),

        entryTime: timestamp("entry_time", { withTimezone: true }).notNull(),
        exitTime: timestamp("exit_time", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [index("trade_user_id_idx").on(table.userId)]
);
