import { type InferSelectModel, sql } from "drizzle-orm";
import {
    boolean,
    index,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { habits, user } from "@/server/db/schema";

export const habitCompletions = pgTable(
    "habit_completion",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),
        habitId: varchar("habit_id", { length: 255 })
            .references(() => habits.id, { onDelete: "cascade" })
            .notNull(),

        completionDate: varchar("completion_date", { length: 10 }).notNull(),
        isCompleted: boolean("is_completed").default(false).notNull(),
        notes: text("notes"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("habit_completion_user_id_idx").on(table.userId),
        index("habit_completion_habit_id_idx").on(table.habitId),
        index("habit_completion_date_idx").on(table.completionDate),
        index("habit_completion_unique_idx").on(
            table.userId,
            table.habitId,
            table.completionDate
        ),
        index("habit_completion_user_date_completed_idx").on(
            table.userId,
            table.completionDate,
            table.isCompleted
        ),
        index("habit_completion_user_habit_date_completed_idx").on(
            table.userId,
            table.habitId,
            table.completionDate,
            table.isCompleted
        ),
    ]
);

export type HabitCompletion = InferSelectModel<typeof habitCompletions>;
