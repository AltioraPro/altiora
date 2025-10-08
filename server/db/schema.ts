import { pgTable, varchar, text, boolean, timestamp, integer, index, pgTableCreator, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const createTable = pgTableCreator((name) => `altiora_${name}`);

export const users = pgTable(
  "user",
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    image: varchar("image", { length: 1024 }),
    emailVerified: timestamp("email_verified"),
    rank: varchar("rank", { length: 50 }).default("NEW").notNull(),
    subscriptionPlan: varchar("subscription_plan", { length: 20 }).default("FREE").notNull(),
    discordId: varchar("discord_id", { length: 255 }),
    discordUsername: varchar("discord_username", { length: 255 }),
    discordDiscriminator: varchar("discord_discriminator", { length: 10 }),
    discordAvatar: varchar("discord_avatar", { length: 1024 }),
    discordConnected: boolean("discord_connected").default(false).notNull(),
    discordRoleSynced: boolean("discord_role_synced").default(false).notNull(),
    lastDiscordSync: timestamp("last_discord_sync"),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    stripeSubscriptionStatus: varchar("stripe_subscription_status", { length: 50 }),
    stripeSubscriptionEndDate: timestamp("stripe_subscription_end_date"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
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
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 1024 }),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId),
    tokenIdx: index("session_token_idx").on(table.token),
  })
);

export const accounts = pgTable(
  "account",
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    accessToken: varchar("access_token", { length: 4096 }),
    refreshToken: varchar("refresh_token", { length: 4096 }),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: varchar("scope", { length: 4096 }),
    idToken: varchar("id_token", { length: 4096 }),
    password: varchar("password", { length: 255 }),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("account_user_id_idx").on(table.userId),
    providerAccountIdx: index("account_provider_account_idx").on(table.providerId, table.accountId),
    providerAccountUnique: unique("account_provider_account_unique").on(table.providerId, table.accountId),
  })
);

/**
 * Table de vérification (Better Auth)
 */
export const verifications = pgTable(
  "verification",
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
    valueIdx: index("verification_value_idx").on(table.value),
    expiresAtIdx: index("verification_expires_at_idx").on(table.expiresAt),
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
    emoji: varchar("emoji", { length: 10 }).notNull(),
    description: text("description"),
    color: varchar("color", { length: 7 }).default("#ffffff"), 
    targetFrequency: varchar("target_frequency", { length: 20 }).default("daily"), 
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0), 
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
  (table) => ({
    userIdIdx: index("habit_completion_user_id_idx").on(table.userId),
    habitIdIdx: index("habit_completion_habit_id_idx").on(table.habitId),
    dateIdx: index("habit_completion_date_idx").on(table.completionDate),
    uniqueUserHabitDate: index("habit_completion_unique_idx").on(table.userId, table.habitId, table.completionDate),
    userDateCompletedIdx: index("habit_completion_user_date_completed_idx").on(table.userId, table.completionDate, table.isCompleted),
    userHabitDateCompletedIdx: index("habit_completion_user_habit_date_completed_idx").on(table.userId, table.habitId, table.completionDate, table.isCompleted),
  })
);

export const trades = createTable(
  "trade",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    symbol: varchar("symbol", { length: 50 }).notNull(),
    side: varchar("side", { length: 10 }).notNull(), 
    quantity: integer("quantity").notNull(),
    entryPrice: varchar("entry_price", { length: 20 }).notNull(),
    exitPrice: varchar("exit_price", { length: 20 }),
    reasoning: text("reasoning").notNull(),
    pnl: varchar("pnl", { length: 20 }),
    
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

export const tradingJournals = createTable(
  "trading_journal",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    order: integer("order").default(0).notNull(),
    startingCapital: varchar("starting_capital", { length: 50 }), 
    usePercentageCalculation: boolean("use_percentage_calculation").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("trading_journal_user_id_idx").on(table.userId),
    activeIdx: index("trading_journal_active_idx").on(table.isActive),
  })
);

/**
 * Table des assets
 */
export const tradingAssets = createTable(
  "trading_asset",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    journalId: varchar("journal_id", { length: 255 })
      .references(() => tradingJournals.id, { onDelete: "cascade" })
      .notNull(),
    
    name: varchar("name", { length: 50 }).notNull(), 
    symbol: varchar("symbol", { length: 20 }).notNull(),
    type: varchar("type", { length: 20 }).default("forex"), 
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("trading_asset_user_id_idx").on(table.userId),
    journalIdIdx: index("trading_asset_journal_id_idx").on(table.journalId),
    symbolIdx: index("trading_asset_symbol_idx").on(table.symbol),
  })
);

/**
 * Table des sessions
 */
export const tradingSessions = createTable(
  "trading_session",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    journalId: varchar("journal_id", { length: 255 })
      .references(() => tradingJournals.id, { onDelete: "cascade" })
      .notNull(),
    
    name: varchar("name", { length: 100 }).notNull(), 
    description: text("description"),
    startTime: varchar("start_time", { length: 5 }), 
    endTime: varchar("end_time", { length: 5 }), 
    timezone: varchar("timezone", { length: 50 }).default("UTC"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("trading_session_user_id_idx").on(table.userId),
    journalIdIdx: index("trading_session_journal_id_idx").on(table.journalId),
  })
);

/**
 * Table des setups
 */
export const tradingSetups = createTable(
  "trading_setup",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    journalId: varchar("journal_id", { length: 255 })
      .references(() => tradingJournals.id, { onDelete: "cascade" })
      .notNull(),
    
    name: varchar("name", { length: 100 }).notNull(), 
    description: text("description"),
    strategy: text("strategy"), 
    successRate: integer("success_rate"), 
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("trading_setup_user_id_idx").on(table.userId),
    journalIdIdx: index("trading_setup_journal_id_idx").on(table.journalId),
  })
);

/**
 * Table des trades 
 */
export const advancedTrades = createTable(
  "advanced_trade",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    journalId: varchar("journal_id", { length: 255 })
      .references(() => tradingJournals.id, { onDelete: "cascade" })
      .notNull(),
    assetId: varchar("asset_id", { length: 255 })
      .references(() => tradingAssets.id, { onDelete: "set null" }),
    sessionId: varchar("session_id", { length: 255 })
      .references(() => tradingSessions.id, { onDelete: "set null" }),
    setupId: varchar("setup_id", { length: 255 })
      .references(() => tradingSetups.id, { onDelete: "set null" }),
    tradeDate: varchar("trade_date", { length: 10 }).notNull(), 
    symbol: varchar("symbol", { length: 50 }).notNull(), 
    riskInput: varchar("risk_input", { length: 50 }), 
    profitLossAmount: varchar("profit_loss_amount", { length: 50 }), 
    profitLossPercentage: varchar("profit_loss_percentage", { length: 50 }), 
    exitReason: varchar("exit_reason", { length: 20 }), 
    breakEvenThreshold: varchar("break_even_threshold", { length: 10 }).default("0.1"), 
    tradingviewLink: varchar("tradingview_link", { length: 1024 }),
    notes: text("notes"),
    isClosed: boolean("is_closed").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("advanced_trade_user_id_idx").on(table.userId),
    journalIdIdx: index("advanced_trade_journal_id_idx").on(table.journalId),
    assetIdIdx: index("advanced_trade_asset_id_idx").on(table.assetId),
    sessionIdIdx: index("advanced_trade_session_id_idx").on(table.sessionId),
    setupIdIdx: index("advanced_trade_setup_id_idx").on(table.setupId),
    tradeDateIdx: index("advanced_trade_date_idx").on(table.tradeDate),
    symbolIdx: index("advanced_trade_symbol_idx").on(table.symbol),
  })
);

/**
 * Plans
 */
export const subscriptionPlans = pgTable(
  "subscription_plan",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 50 }).notNull(), 
    displayName: varchar("display_name", { length: 100 }).notNull(),
    description: text("description"),
    price: integer("price").notNull(), 
    currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
    billingInterval: varchar("billing_interval", { length: 20 }).default("monthly").notNull(), 
    stripePriceId: varchar("stripe_price_id", { length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    maxHabits: integer("max_habits").default(3).notNull(),
    maxTradingEntries: integer("max_trading_entries").default(10).notNull(), 
    maxAnnualGoals: integer("max_annual_goals").default(1).notNull(),
    maxQuarterlyGoals: integer("max_quarterly_goals").default(1).notNull(),
    maxMonthlyGoals: integer("max_monthly_goals").default(0).notNull(),
    hasDiscordIntegration: boolean("has_discord_integration").default(false).notNull(),
    hasPrioritySupport: boolean("has_priority_support").default(false).notNull(),
    hasEarlyAccess: boolean("has_early_access").default(false).notNull(),
    hasMonthlyChallenges: boolean("has_monthly_challenges").default(false).notNull(),
    hasPremiumDiscord: boolean("has_premium_discord").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }
);

/**
 * Utilisation mensuelle des utilisateurs
 */
export const monthlyUsage = pgTable(
  "monthly_usage",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    month: varchar("month", { length: 7 }).notNull(), 
    tradingEntriesCount: integer("trading_entries_count").default(0).notNull(),
    habitsCreatedCount: integer("habits_created_count").default(0).notNull(),
    goalsCreatedCount: integer("goals_created_count").default(0).notNull(),
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdMonthIdx: index("monthly_usage_user_month_idx").on(table.userId, table.month),
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
    
    remindersEnabled: boolean("reminders_enabled").default(false).notNull(),
    reminderFrequency: varchar("reminder_frequency", { length: 20 }), 
    lastReminderSent: timestamp("last_reminder_sent", { withTimezone: true }),
    nextReminderDate: timestamp("next_reminder_date", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("goal_user_id_idx").on(table.userId),
    typeIdx: index("goal_type_idx").on(table.type),
    activeIdx: index("goal_active_idx").on(table.isActive),
    reminderIdx: index("goal_reminder_idx").on(table.remindersEnabled, table.nextReminderDate),
  })
);

/**
 * Table des sessions Pomodoro Discord
 */
export const discordPomodoroSessions = createTable(
  "discord_pomodoro_session",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    discordId: varchar("discord_id", { length: 255 }).notNull(),
    channelId: varchar("channel_id", { length: 255 }).notNull(),
    
    duration: integer("duration").notNull(),
    workTime: integer("work_time").notNull(),
    breakTime: integer("break_time").notNull(),
    format: varchar("format", { length: 20 }).notNull(),
    
    status: varchar("status", { length: 20 }).default("active").notNull(),
    currentPhase: varchar("current_phase", { length: 20 }).default("work").notNull(),
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
  (table) => ({
    userIdIdx: index("discord_pomodoro_user_id_idx").on(table.userId),
    discordIdIdx: index("discord_pomodoro_discord_id_idx").on(table.discordId),
    statusIdx: index("discord_pomodoro_status_idx").on(table.status),
    startedAtIdx: index("discord_pomodoro_started_at_idx").on(table.startedAt),
  })
);

/**
 * Table des sous-objectifs
 */
export const subGoals = createTable(
  "sub_goal",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    goalId: varchar("goal_id", { length: 255 })
      .references(() => goals.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
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
  (table) => ({
    goalIdIdx: index("sub_goal_goal_id_idx").on(table.goalId),
    userIdIdx: index("sub_goal_user_id_idx").on(table.userId),
  })
);

/**
 * Table des tâches associées aux objectifs
 */
export const goalTasks = createTable(
  "goal_task",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    goalId: varchar("goal_id", { length: 255 })
      .references(() => goals.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
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
  (table) => ({
    goalIdIdx: index("goal_task_goal_id_idx").on(table.goalId),
    userIdIdx: index("goal_task_user_id_idx").on(table.userId),
    dueDateIdx: index("goal_task_due_date_idx").on(table.dueDate),
  })
);

/**
 * Table des rappels envoyés
 */
export const goalReminders = createTable(
  "goal_reminder",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    goalId: varchar("goal_id", { length: 255 })
      .references(() => goals.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    reminderType: varchar("reminder_type", { length: 20 }).notNull(), 
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 20 }).default("sent"), 
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    goalIdIdx: index("goal_reminder_goal_id_idx").on(table.goalId),
    userIdIdx: index("goal_reminder_user_id_idx").on(table.userId),
    sentAtIdx: index("goal_reminder_sent_at_idx").on(table.sentAt),
  })
);

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

export type TradingJournal = typeof tradingJournals.$inferSelect;
export type NewTradingJournal = typeof tradingJournals.$inferInsert;
export type TradingAsset = typeof tradingAssets.$inferSelect;
export type NewTradingAsset = typeof tradingAssets.$inferInsert;
export type TradingSession = typeof tradingSessions.$inferSelect;
export type NewTradingSession = typeof tradingSessions.$inferInsert;
export type TradingSetup = typeof tradingSetups.$inferSelect;
export type NewTradingSetup = typeof tradingSetups.$inferInsert;
export type AdvancedTrade = typeof advancedTrades.$inferSelect;
export type NewAdvancedTrade = typeof advancedTrades.$inferInsert;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type MonthlyUsage = typeof monthlyUsage.$inferSelect;
export type NewMonthlyUsage = typeof monthlyUsage.$inferInsert; 

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type SubGoal = typeof subGoals.$inferSelect;
export type NewSubGoal = typeof subGoals.$inferInsert;
export type GoalTask = typeof goalTasks.$inferSelect;
export type NewGoalTask = typeof goalTasks.$inferInsert;
export type GoalReminder = typeof goalReminders.$inferSelect;
export type NewGoalReminder = typeof goalReminders.$inferInsert; 