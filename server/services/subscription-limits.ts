import { TRPCError } from "@trpc/server";
import { eq, and, gte, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { users, subscriptionPlans, monthlyUsage, habits, trades, goals } from "@/server/db/schema";
import { createId } from "@paralleldrive/cuid2";

export interface PlanLimits {
  maxHabits: number;
  maxTradingEntries: number;
  maxAnnualGoals: number;
  maxQuarterlyGoals: number;
  maxMonthlyGoals: number;
  hasDiscordIntegration: boolean;
  hasPrioritySupport: boolean;
  hasEarlyAccess: boolean;
  hasMonthlyChallenges: boolean;
  hasPremiumDiscord: boolean;
}

export interface UsageStats {
  currentHabits: number;
  currentTradingEntries: number;
  currentAnnualGoals: number;
  currentQuarterlyGoals: number;
  currentMonthlyGoals: number;
  monthlyTradingEntries: number;
}

export class SubscriptionLimitsService {
  static async getUserPlanLimits(userId: string): Promise<PlanLimits> {
    try {
      const user = await db
        .select({ subscriptionPlan: users.subscriptionPlan })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const plan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.name, user[0].subscriptionPlan))
        .limit(1);

      if (!plan[0]) {
        return {
          maxHabits: 3,
          maxTradingEntries: 10,
          maxAnnualGoals: 1,
          maxQuarterlyGoals: 1,
          maxMonthlyGoals: 0,
          hasDiscordIntegration: false,
          hasPrioritySupport: false,
          hasEarlyAccess: false,
          hasMonthlyChallenges: false,
          hasPremiumDiscord: false,
        };
      }

      return {
        maxHabits: plan[0].maxHabits,
        maxTradingEntries: plan[0].maxTradingEntries,
        maxAnnualGoals: plan[0].maxAnnualGoals,
        maxQuarterlyGoals: plan[0].maxQuarterlyGoals,
        maxMonthlyGoals: plan[0].maxMonthlyGoals,
        hasDiscordIntegration: plan[0].hasDiscordIntegration,
        hasPrioritySupport: plan[0].hasPrioritySupport,
        hasEarlyAccess: plan[0].hasEarlyAccess,
        hasMonthlyChallenges: plan[0].hasMonthlyChallenges,
        hasPremiumDiscord: plan[0].hasPremiumDiscord,
      };
    } catch (error) {
      console.error("Error getting user plan limits:", error);

      return {
        maxHabits: 3,
        maxTradingEntries: 10,
        maxAnnualGoals: 1,
        maxQuarterlyGoals: 1,
        maxMonthlyGoals: 0,
        hasDiscordIntegration: false,
        hasPrioritySupport: false,
        hasEarlyAccess: false,
        hasMonthlyChallenges: false,
        hasPremiumDiscord: false,
      };
    }
  }

  static async getUserUsageStats(userId: string): Promise<UsageStats> {
    const currentMonth = new Date().toISOString().slice(0, 7); 

    const [habitsCount, tradingEntriesCount, goalsCounts] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(habits)
        .where(and(eq(habits.userId, userId), eq(habits.isActive, true))),

      (async () => {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        return await db
          .select({ count: sql<number>`count(*)` })
          .from(trades)
          .where(and(eq(trades.userId, userId), gte(trades.createdAt, monthStart)));
      })(),

      (async () => {
        try {
          return await db
            .select({
              type: goals.type,
              count: sql<number>`count(*)`,
            })
            .from(goals)
            .where(eq(goals.userId, userId))
            .groupBy(goals.type);
        } catch (error) {
          console.warn("Goals table not found, using default values:", error);
          return [];
        }
      })(),
    ]);

    const goalsByType: Record<string, number> = { annual: 0, quarterly: 0, monthly: 0 };
    goalsCounts.forEach(goal => {
      goalsByType[goal.type] = Number(goal.count);
    });

    return {
      currentHabits: Number(habitsCount[0]?.count || 0),
      currentTradingEntries: Number(tradingEntriesCount[0]?.count || 0),
      currentAnnualGoals: goalsByType["annual"] || 0,
      currentQuarterlyGoals: goalsByType["quarterly"] || 0,
      currentMonthlyGoals: goalsByType["monthly"] || 0,
      monthlyTradingEntries: Number(tradingEntriesCount[0]?.count || 0),
    };
  }

  static async canCreateHabit(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    const [limits, usage] = await Promise.all([
      this.getUserPlanLimits(userId),
      this.getUserUsageStats(userId),
    ]);

    if (usage.currentHabits >= limits.maxHabits) {
      return {
        canCreate: false,
        reason: `You have reached the limit of ${limits.maxHabits} habits for your plan.`,
      };
    }

    return { canCreate: true };
  }

  static async canCreateTradingEntry(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    const [limits, usage] = await Promise.all([
      this.getUserPlanLimits(userId),
      this.getUserUsageStats(userId),
    ]);

    if (usage.monthlyTradingEntries >= limits.maxTradingEntries) {
      return {
        canCreate: false,
        reason: `You have reached the limit of ${limits.maxTradingEntries} trading entries per month for your plan.`,
      };
    }

    return { canCreate: true };
  }

  static async canCreateGoal(userId: string, goalType: "annual" | "quarterly" | "monthly"): Promise<{ canCreate: boolean; reason?: string }> {
    const [limits, usage] = await Promise.all([
      this.getUserPlanLimits(userId),
      this.getUserUsageStats(userId),
    ]);

    let currentCount: number;
    let maxCount: number;

    switch (goalType) {
      case "annual":
        currentCount = usage.currentAnnualGoals;
        maxCount = limits.maxAnnualGoals;
        break;
      case "quarterly":
        currentCount = usage.currentQuarterlyGoals;
        maxCount = limits.maxQuarterlyGoals;
        break;
      case "monthly":
        currentCount = usage.currentMonthlyGoals;
        maxCount = limits.maxMonthlyGoals;
        break;
      default:
        return { canCreate: false, reason: "Unrecognized goal type." };
    }

    if (currentCount >= maxCount) {
      return {
        canCreate: false,
        reason: `You have reached the limit of ${maxCount} ${goalType} goals for your plan.`,
      };
    }

    return { canCreate: true };
  }

  static async getAllGoalLimits(userId: string): Promise<{
    annual: { canCreate: boolean; reason?: string; current: number; max: number };
    quarterly: { canCreate: boolean; reason?: string; current: number; max: number };
    monthly: { canCreate: boolean; reason?: string; current: number; max: number };
    canCreateAny: boolean;
  }> {
    const [limits, usage] = await Promise.all([
      this.getUserPlanLimits(userId),
      this.getUserUsageStats(userId),
    ]);

    const annual = {
      current: usage.currentAnnualGoals,
      max: limits.maxAnnualGoals,
      canCreate: usage.currentAnnualGoals < limits.maxAnnualGoals,
      reason: usage.currentAnnualGoals >= limits.maxAnnualGoals 
        ? `You have reached the limit of ${limits.maxAnnualGoals} annual goals for your plan.`
        : undefined,
    };

    const quarterly = {
      current: usage.currentQuarterlyGoals,
      max: limits.maxQuarterlyGoals,
      canCreate: usage.currentQuarterlyGoals < limits.maxQuarterlyGoals,
      reason: usage.currentQuarterlyGoals >= limits.maxQuarterlyGoals 
        ? `You have reached the limit of ${limits.maxQuarterlyGoals} quarterly goals for your plan.`
        : undefined,
    };

    const monthly = {
      current: usage.currentMonthlyGoals,
      max: limits.maxMonthlyGoals,
      canCreate: usage.currentMonthlyGoals < limits.maxMonthlyGoals,
      reason: usage.currentMonthlyGoals >= limits.maxMonthlyGoals 
        ? `You have reached the limit of ${limits.maxMonthlyGoals} monthly goals for your plan.`
        : undefined,
    };

    return {
      annual,
      quarterly,
      monthly,
      canCreateAny: annual.canCreate || quarterly.canCreate || monthly.canCreate,
    };
  }

  static async incrementMonthlyUsage(userId: string, type: "trading" | "habits" | "goals"): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const existingUsage = await db
      .select()
      .from(monthlyUsage)
      .where(and(eq(monthlyUsage.userId, userId), eq(monthlyUsage.month, currentMonth)))
      .limit(1);

    if (existingUsage[0]) {
      const updateData: any = {};
      switch (type) {
        case "trading":
          updateData.tradingEntriesCount = sql`${monthlyUsage.tradingEntriesCount} + 1`;
          break;
        case "habits":
          updateData.habitsCreatedCount = sql`${monthlyUsage.habitsCreatedCount} + 1`;
          break;
        case "goals":
          updateData.goalsCreatedCount = sql`${monthlyUsage.goalsCreatedCount} + 1`;
          break;
      }

      await db
        .update(monthlyUsage)
        .set(updateData)
        .where(eq(monthlyUsage.id, existingUsage[0].id));
    } else {

      const newUsage = {
        id: createId(),
        userId,
        month: currentMonth,
        tradingEntriesCount: type === "trading" ? 1 : 0,
        habitsCreatedCount: type === "habits" ? 1 : 0,
        goalsCreatedCount: type === "goals" ? 1 : 0,
      };

      await db.insert(monthlyUsage).values(newUsage);
    }
  }

  static async hasFeatureAccess(userId: string, feature: keyof Omit<PlanLimits, "maxHabits" | "maxTradingEntries" | "maxAnnualGoals" | "maxQuarterlyGoals" | "maxMonthlyGoals">): Promise<boolean> {
    const limits = await this.getUserPlanLimits(userId);
    return limits[feature];
  }
}