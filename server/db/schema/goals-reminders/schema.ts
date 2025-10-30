import { type InferSelectModel, sql } from "drizzle-orm";
import { index, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { goals, user } from "@/server/db/schema";

export const goalReminders = pgTable(
    "goal_reminder",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        goalId: varchar("goal_id", { length: 255 })
            .references(() => goals.id, { onDelete: "cascade" })
            .notNull(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),

        reminderType: varchar("reminder_type", { length: 20 }).notNull(),
        sentAt: timestamp("sent_at", { withTimezone: true }).notNull(),
        status: varchar("status", { length: 20 }).default("sent"),

        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("goal_reminder_goal_id_idx").on(table.goalId),
        index("goal_reminder_user_id_idx").on(table.userId),
        index("goal_reminder_sent_at_idx").on(table.sentAt),
    ]
);

export type GoalReminder = InferSelectModel<typeof goalReminders>;
