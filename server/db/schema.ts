import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  pgTableCreator,
  timestamp,
  varchar,
  boolean,
  text,
  integer,
} from "drizzle-orm/pg-core";

/**
 * Table creator avec préfixe pour les tables métier
 */
export const createTable = pgTableCreator((name) => `altiora_${name}`);

/**
 * Table des utilisateurs (Better Auth)
 */
export const users = pgTable(
  "user",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    image: varchar("image", { length: 1024 }),
    emailVerified: boolean("email_verified").default(false).notNull(),
    
    // Rank and subscription fields
    rank: varchar("rank", { length: 50 }).default("NEW").notNull(),
    subscriptionPlan: varchar("subscription_plan", { length: 20 }).default("FREE").notNull(),
    
    // Stripe fields
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    stripeSubscriptionStatus: varchar("stripe_subscription_status", { length: 50 }),
    stripeSubscriptionEndDate: timestamp("stripe_subscription_end_date", { withTimezone: true }),
    
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
    stripeCustomerIdx: index("user_stripe_customer_idx").on(table.stripeCustomerId),
  })
);

/**
 * Table des sessions (Better Auth)
 */
export const sessions = pgTable(
  "session",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    token: varchar("token", { length: 255 }).notNull(),
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
    tokenIdx: index("session_token_idx").on(table.token),
  })
);

/**
 * Table des comptes (Better Auth)
 */
export const accounts = pgTable(
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
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: varchar("scope", { length: 1024 }),
    idToken: varchar("id_token", { length: 1024 }),
    password: varchar("password", { length: 255 }),
    
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
 * Table de vérification (Better Auth)
 */
export const verifications = pgTable(
  "verification",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  })
);

/**
 * Habits table
 */
export const habits = createTable(
  "habit",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    title: varchar("title", { length: 255 }).notNull(),
    emoji: varchar("emoji", { length: 10 }).notNull(), // Emoji associated with the habit
    description: text("description"),
    color: varchar("color", { length: 7 }).default("#ffffff"), // Hexadecimal color for personalization
    targetFrequency: varchar("target_frequency", { length: 20 }).default("daily"), // daily, weekly, monthly
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0), // For display order
    
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
    activeIdx: index("habit_active_idx").on(table.isActive),
  })
);

/**
 * Daily habit completions table
 */
export const habitCompletions = createTable(
  "habit_completion",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    habitId: varchar("habit_id", { length: 255 })
      .references(() => habits.id, { onDelete: "cascade" })
      .notNull(),
    
    completionDate: varchar("completion_date", { length: 10 }).notNull(), // Format YYYY-MM-DD
    isCompleted: boolean("is_completed").default(false).notNull(),
    notes: text("notes"), // Optional notes about the completion
    
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("habit_completion_user_id_idx").on(table.userId),
    habitIdIdx: index("habit_completion_habit_id_idx").on(table.habitId),
    dateIdx: index("habit_completion_date_idx").on(table.completionDate),
    uniqueUserHabitDate: index("habit_completion_unique_idx").on(table.userId, table.habitId, table.completionDate),
    userDateCompletedIdx: index("habit_completion_user_date_completed_idx").on(table.userId, table.completionDate, table.isCompleted),
    userHabitDateCompletedIdx: index("habit_completion_user_habit_date_completed_idx").on(table.userId, table.habitId, table.completionDate, table.isCompleted),
  })
);

/**
 * Table des trades
 */
export const trades = createTable(
  "trade",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    symbol: varchar("symbol", { length: 50 }).notNull(),
    side: varchar("side", { length: 10 }).notNull(), // buy, sell
    quantity: integer("quantity").notNull(),
    entryPrice: varchar("entry_price", { length: 20 }).notNull(),
    exitPrice: varchar("exit_price", { length: 20 }),
    reasoning: text("reasoning").notNull(),
    pnl: varchar("pnl", { length: 20 }),
    
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
  })
);

// Export des types pour TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;
export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert; 