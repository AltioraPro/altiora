import { sql } from "drizzle-orm";
import {
    index,
    integer,
    pgTable,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { user } from "@/server/db/schema";

export const discordPomodoroSessions = pgTable(
    "discord_pomodoro_session",
    {
        id: varchar("id", { length: 255 }).primaryKey(),
        userId: varchar("user_id", { length: 255 })
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),
        discordId: varchar("discord_id", { length: 255 }).notNull(),
        channelId: varchar("channel_id", { length: 255 }).notNull(),

        duration: integer("duration").notNull(),
        workTime: integer("work_time").notNull(),
        breakTime: integer("break_time").notNull(),
        format: varchar("format", { length: 20 }).notNull(),

        status: varchar("status", { length: 20 }).default("active").notNull(),
        currentPhase: varchar("current_phase", { length: 20 })
            .default("work")
            .notNull(),
        phaseStartTime: timestamp("phase_start_time", { withTimezone: true }),
        totalWorkTime: integer("total_work_time").default(0).notNull(),
        totalBreakTime: integer("total_break_time").default(0).notNull(),

        startedAt: timestamp("started_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        endedAt: timestamp("ended_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index("discord_pomodoro_user_id_idx").on(table.userId),
        index("discord_pomodoro_discord_id_idx").on(table.discordId),
        index("discord_pomodoro_status_idx").on(table.status),
        index("discord_pomodoro_started_at_idx").on(table.startedAt),
    ]
);
