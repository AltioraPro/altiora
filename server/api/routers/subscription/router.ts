import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { SubscriptionLimitsService } from "@/server/services/subscription-limits";

export const subscriptionRouter = createTRPCRouter({
  /**
   * Get user plan limits
   */
  getPlanLimits: protectedProcedure
    .query(async ({ ctx }) => {
      return await SubscriptionLimitsService.getUserPlanLimits(ctx.session.userId);
    }),

  /**
   * Get user usage statistics
   */
  getUsageStats: protectedProcedure
    .query(async ({ ctx }) => {
      return await SubscriptionLimitsService.getUserUsageStats(ctx.session.userId);
    }),

  /**
   * Check if user can create a habit
   */
  canCreateHabit: protectedProcedure
    .query(async ({ ctx }) => {
      return await SubscriptionLimitsService.canCreateHabit(ctx.session.userId);
    }),

  /**
   * Check if user can create a trading entry
   */
  canCreateTradingEntry: protectedProcedure
    .query(async ({ ctx }) => {
      return await SubscriptionLimitsService.canCreateTradingEntry(ctx.session.userId);
    }),

  /**
   * Check if user can create a goal
   */
  canCreateGoal: protectedProcedure
    .input(z.object({
      goalType: z.enum(["annual", "quarterly", "monthly"])
    }))
    .query(async ({ ctx, input }) => {
      return await SubscriptionLimitsService.canCreateGoal(ctx.session.userId, input.goalType);
    }),

  /**
   * Check if user has access to a specific feature
   */
  hasFeatureAccess: protectedProcedure
    .input(z.object({
      feature: z.enum([
        "hasDiscordIntegration",
        "hasPrioritySupport", 
        "hasEarlyAccess",
        "hasMonthlyChallenges",
        "hasPremiumDiscord"
      ])
    }))
    .query(async ({ ctx, input }) => {
      return await SubscriptionLimitsService.hasFeatureAccess(ctx.session.userId, input.feature);
    }),

  /**
   * Get complete summary of limits and usage
   */
  getLimitsSummary: protectedProcedure
    .query(async ({ ctx }) => {
      const [limits, usage, userPlan] = await Promise.all([
        SubscriptionLimitsService.getUserPlanLimits(ctx.session.userId),
        SubscriptionLimitsService.getUserUsageStats(ctx.session.userId),
        ctx.db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, ctx.session.userId),
          columns: { subscriptionPlan: true },
        }),
      ]);

      return {
        limits,
        usage,
        planName: userPlan?.subscriptionPlan || "FREE",
        canCreateHabit: usage.currentHabits < limits.maxHabits,
        canCreateTradingEntry: usage.monthlyTradingEntries < limits.maxTradingEntries,
        canCreateAnnualGoal: usage.currentAnnualGoals < limits.maxAnnualGoals,
        canCreateQuarterlyGoal: usage.currentQuarterlyGoals < limits.maxQuarterlyGoals,
        canCreateMonthlyGoal: usage.currentMonthlyGoals < limits.maxMonthlyGoals,
      };
    }),
});