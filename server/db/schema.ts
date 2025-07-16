import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  timestamp,
  varchar,
  boolean,
  text,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * Table creator avec préfixe pour éviter les conflits
 */
export const createTable = pgTableCreator((name) => `altiora_${name}`);

/**
 * Table des utilisateurs
 */
export const users = createTable(
  "user",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    imageUrl: varchar("image_url", { length: 1024 }),
    username: varchar("username", { length: 255 }).unique(),
    hashedPassword: varchar("hashed_password", { length: 255 }),
    emailVerified: boolean("email_verified").default(false).notNull(),
    
    // Subscription info
    isProUser: boolean("is_pro_user").default(false).notNull(),
    subscriptionId: varchar("subscription_id", { length: 255 }),
    subscriptionStatus: varchar("subscription_status", { length: 50 }),
    subscriptionPeriodEnd: timestamp("subscription_period_end"),
    
    // Settings
    preferences: jsonb("preferences").$type<{
      theme?: 'light' | 'dark';
      notifications?: boolean;
      discordIntegration?: boolean;
      timezone?: string;
    }>().default({}),
    
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    emailIdx: index("user_email_idx").on(table.email),
  })
);

/**
 * Table des sessions
 */
export const sessions = createTable(
  "session",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 1024 }),
    
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId),
    expiresAtIdx: index("session_expires_at_idx").on(table.expiresAt),
  })
);

/**
 * Table des comptes (OAuth providers)
 */
export const accounts = createTable(
  "account",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    accessToken: varchar("access_token", { length: 1024 }),
    refreshToken: varchar("refresh_token", { length: 1024 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    scope: varchar("scope", { length: 1024 }),
    
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("account_user_id_idx").on(table.userId),
    providerAccountIdx: index("account_provider_account_idx").on(table.providerId, table.accountId),
  })
);

/**
 * Table des habitudes
 */
export const habits = createTable(
  "habit",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    // Habit details
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    color: varchar("color", { length: 7 }).default("#ffffff"),
    icon: varchar("icon", { length: 50 }),
    
    // Settings
    frequency: varchar("frequency", { length: 20 }).default("daily").notNull(), // daily, weekly, custom
    targetValue: integer("target_value").default(1).notNull(),
    unit: varchar("unit", { length: 50 }).default("times"),
    
    // Tracking
    isActive: boolean("is_active").default(true).notNull(),
    currentStreak: integer("current_streak").default(0).notNull(),
    longestStreak: integer("longest_streak").default(0).notNull(),
    totalCompletions: integer("total_completions").default(0).notNull(),
    
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("habit_user_id_idx").on(table.userId),
    titleIdx: index("habit_title_idx").on(table.title),
  })
);

/**
 * Table des complétions d'habitudes
 */
export const habitCompletions = createTable(
  "habit_completion",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    habitId: varchar("habit_id", { length: 255 })
      .references(() => habits.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    // Completion details
    completedAt: timestamp("completed_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    value: integer("value").default(1).notNull(),
    notes: text("notes"),
    
    // Metadata
    streakDay: integer("streak_day").notNull(),
    
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    habitIdIdx: index("habit_completion_habit_id_idx").on(table.habitId),
    userIdIdx: index("habit_completion_user_id_idx").on(table.userId),
    completedAtIdx: index("habit_completion_completed_at_idx").on(table.completedAt),
  })
);

/**
 * Table des trades (journal de trading)
 */
export const trades = createTable(
  "trade",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    // Trade details
    symbol: varchar("symbol", { length: 50 }).notNull(),
    side: varchar("side", { length: 10 }).notNull(), // buy, sell
    quantity: integer("quantity").notNull(),
    entryPrice: varchar("entry_price", { length: 20 }).notNull(),
    exitPrice: varchar("exit_price", { length: 20 }),
    
    // Analysis
    reasoning: text("reasoning").notNull(),
    emotion: varchar("emotion", { length: 50 }),
    confidence: integer("confidence"), // 1-10
    riskReward: varchar("risk_reward", { length: 20 }),
    
    // Results
    pnl: varchar("pnl", { length: 20 }),
    pnlPercentage: varchar("pnl_percentage", { length: 10 }),
    result: varchar("result", { length: 20 }), // win, loss, breakeven
    
    // Metadata
    tags: jsonb("tags").$type<string[]>().default([]),
    notes: text("notes"),
    
    // Timestamps
    entryTime: timestamp("entry_time", { withTimezone: true }).notNull(),
    exitTime: timestamp("exit_time", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("trade_user_id_idx").on(table.userId),
    symbolIdx: index("trade_symbol_idx").on(table.symbol),
    entryTimeIdx: index("trade_entry_time_idx").on(table.entryTime),
  })
);

/**
 * Table des objectifs
 */
export const goals = createTable(
  "goal",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    // Goal details
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(), // trading, habits, personal, financial
    
    // Progress
    targetValue: integer("target_value").notNull(),
    currentValue: integer("current_value").default(0).notNull(),
    unit: varchar("unit", { length: 50 }).notNull(),
    
    // Timeline
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    targetDate: timestamp("target_date", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    
    // Settings
    isActive: boolean("is_active").default(true).notNull(),
    priority: varchar("priority", { length: 20 }).default("medium").notNull(), // low, medium, high
    
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("goal_user_id_idx").on(table.userId),
    categoryIdx: index("goal_category_idx").on(table.category),
    targetDateIdx: index("goal_target_date_idx").on(table.targetDate),
  })
);

/**
 * Table des sessions Pomodoro
 */
export const pomodoroSessions = createTable(
  "pomodoro_session",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    // Session details
    duration: integer("duration").notNull(), // in minutes
    type: varchar("type", { length: 20 }).default("work").notNull(), // work, break, long_break
    taskName: varchar("task_name", { length: 255 }),
    notes: text("notes"),
    
    // Status
    isCompleted: boolean("is_completed").default(false).notNull(),
    discordNotified: boolean("discord_notified").default(false).notNull(),
    
    // Timestamps
    startedAt: timestamp("started_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("pomodoro_session_user_id_idx").on(table.userId),
    startedAtIdx: index("pomodoro_session_started_at_idx").on(table.startedAt),
  })
);

// Export des types pour TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;
export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
export type NewPomodoroSession = typeof pomodoroSessions.$inferInsert; 