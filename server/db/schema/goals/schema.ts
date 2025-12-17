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
import { goalCategories } from "../goal-categories/schema";

export const goals = pgTable(
    "goal",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),

        title: varchar("title", { length: 255 }).notNull(),
        description: text("description"),
        type: varchar("type", { length: 20 }).notNull(),
        goalType: varchar("goal_type", { length: 20 }).notNull(),
        targetValue: varchar("target_value", { length: 100 }),
        currentValue: varchar("current_value", { length: 100 }).default("0"),
        unit: varchar("unit", { length: 50 }),
        deadline: timestamp("deadline", { withTimezone: true }),
        isCompleted: boolean("is_completed").default(false).notNull(),
        isActive: boolean("is_active").default(true).notNull(),
        sortOrder: integer("sort_order").default(0),

        categoryId: varchar("category_id", { length: 255 })
            .references(() => goalCategories.id, { onDelete: "set null" }),

        remindersEnabled: boolean("reminders_enabled").default(false).notNull(),
        reminderFrequency: varchar("reminder_frequency", { length: 20 }),
        lastReminderSent: timestamp("last_reminder_sent", {
            withTimezone: true,
        }),
        nextReminderDate: timestamp("next_reminder_date", {
            withTimezone: true,
        }),

        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("goal_user_id_idx").on(table.userId),
        index("goal_type_idx").on(table.type),
        index("goal_active_idx").on(table.isActive),
        index("goal_category_id_idx").on(table.categoryId),
        index("goal_reminder_idx").on(
            table.remindersEnabled,
            table.nextReminderDate
        ),
    ]
);

export type Goal = InferSelectModel<typeof goals>;
