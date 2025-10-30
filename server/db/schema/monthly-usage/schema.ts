import { sql } from "drizzle-orm";
import {
    index,
    integer,
    pgTable,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { user } from "@/server/db/schema";

export const monthlyUsage = pgTable(
    "monthly_usage",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),
        month: varchar("month", { length: 7 }).notNull(),
        tradingEntriesCount: integer("trading_entries_count")
            .default(0)
            .notNull(),
        habitsCreatedCount: integer("habits_created_count")
            .default(0)
            .notNull(),
        goalsCreatedCount: integer("goals_created_count").default(0).notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("monthly_usage_user_month_idx").on(table.userId, table.month),
    ]
);
