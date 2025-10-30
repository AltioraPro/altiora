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
import { goals, user } from "@/server/db/schema";

export const goalTasks = pgTable(
    "goal_task",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        goalId: varchar("goal_id", { length: 255 })
            .references(() => goals.id, { onDelete: "cascade" })
            .notNull(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),

        title: varchar("title", { length: 255 }).notNull(),
        description: text("description"),
        dueDate: timestamp("due_date", { withTimezone: true }),
        isCompleted: boolean("is_completed").default(false).notNull(),
        priority: varchar("priority", { length: 20 }).default("medium"),
        sortOrder: integer("sort_order").default(0),

        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("goal_task_goal_id_idx").on(table.goalId),
        index("goal_task_user_id_idx").on(table.userId),
        index("goal_task_due_date_idx").on(table.dueDate),
    ]
);

export type GoalTask = InferSelectModel<typeof goalTasks>;
