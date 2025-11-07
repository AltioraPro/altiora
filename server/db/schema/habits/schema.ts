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

export const habits = pgTable(
    "habit",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),

        title: varchar("title", { length: 255 }).notNull(),
        emoji: varchar("emoji", { length: 10 }).notNull(),
        description: text("description"),
        color: varchar("color", { length: 7 }).default("#ffffff"),
        targetFrequency: varchar("target_frequency", { length: 20 }).default(
            "daily"
        ),
        isActive: boolean("is_active").default(true).notNull(),
        sortOrder: integer("sort_order").default(0),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("habit_user_id_idx").on(table.userId),
        index("habit_active_idx").on(table.isActive),
    ]
);

export type Habit = InferSelectModel<typeof habits>;
