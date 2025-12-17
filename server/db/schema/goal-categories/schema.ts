import { type InferSelectModel, sql } from "drizzle-orm";
import {
    index,
    pgTable,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { user } from "@/server/db/schema";

export const goalCategories = pgTable(
    "goal_category",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),

        name: varchar("name", { length: 100 }).notNull(),
        color: varchar("color", { length: 20 }).notNull().default("#6366f1"),
        icon: varchar("icon", { length: 50 }),

        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("goal_category_user_id_idx").on(table.userId),
        index("goal_category_name_idx").on(table.name),
    ]
);

export type GoalCategory = InferSelectModel<typeof goalCategories>;
