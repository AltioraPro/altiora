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
import { goals, user } from "../../schema";

export const subGoals = pgTable(
    "sub_goal",
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
        isCompleted: boolean("is_completed").default(false).notNull(),
        sortOrder: integer("sort_order").default(0),

        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("sub_goal_goal_id_idx").on(table.goalId),
        index("sub_goal_user_id_idx").on(table.userId),
    ]
);

export type SubGoal = InferSelectModel<typeof subGoals>;
