import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import { 
  createGoalValidator,
  updateGoalValidator, 
  deleteGoalValidator,
  markGoalCompletedValidator,
  updateGoalProgressValidator,
  getGoalsPaginatedValidator,
  getGoalStatsValidator,
  createSubGoalValidator,
  updateSubGoalValidator,
  deleteSubGoalValidator,
  createGoalTaskValidator,
  updateGoalTaskValidator,
  deleteGoalTaskValidator
} from "./validators";
import { 
  createGoal, 
  updateGoal, 
  deleteGoal, 
  markGoalCompleted,
  updateGoalProgress,
  reorderGoals,
  createSubGoal,
  updateSubGoal,
  deleteSubGoal,
  createGoalTask,
  updateGoalTask,
  deleteGoalTask,
  markTaskCompleted
} from "./mutations";
import { 
  getUserGoals, 
  getGoalsPaginated, 
  getGoalById,
  getGoalWithDetails,
  getGoalStats,
  getGoalsByType,
  getUpcomingDeadlines
} from "./queries";

export const goalsRouter = createTRPCRouter({
  
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserGoals(ctx.session.userId);
    }),

  getPaginated: protectedProcedure
    .input(getGoalsPaginatedValidator)
    .query(async ({ ctx, input }) => {
      return await getGoalsPaginated(ctx.session.userId, input);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await getGoalById(input.id, ctx.session.userId);
    }),

  getWithDetails: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await getGoalWithDetails(input.id, ctx.session.userId);
    }),

  getStats: protectedProcedure
    .input(getGoalStatsValidator)
    .query(async ({ ctx, input }) => {
      return await getGoalStats(ctx.session.userId);
    }),

  getByType: protectedProcedure
    .input(z.object({ type: z.enum(["annual", "quarterly", "monthly"]) }))
    .query(async ({ ctx, input }) => {
      return await getGoalsByType(ctx.session.userId, input.type);
    }),

  getUpcomingDeadlines: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(30).default(7) }))
    .query(async ({ ctx, input }) => {
      return await getUpcomingDeadlines(ctx.session.userId, input.days);
    }),

  create: protectedProcedure
    .input(createGoalValidator)
    .mutation(async ({ ctx, input }) => {
      return await createGoal(input, ctx.session.userId);
    }),

  update: protectedProcedure
    .input(updateGoalValidator)
    .mutation(async ({ ctx, input }) => {
      return await updateGoal(input, ctx.session.userId);
    }),

  delete: protectedProcedure
    .input(deleteGoalValidator)
    .mutation(async ({ ctx, input }) => {
      return await deleteGoal(input.id, ctx.session.userId);
    }),

  markCompleted: protectedProcedure
    .input(markGoalCompletedValidator)
    .mutation(async ({ ctx, input }) => {
      return await markGoalCompleted(input.id, input.isCompleted, ctx.session.userId);
    }),

  updateProgress: protectedProcedure
    .input(updateGoalProgressValidator)
    .mutation(async ({ ctx, input }) => {
      return await updateGoalProgress(input.id, input.currentValue, ctx.session.userId);
    }),

  reorder: protectedProcedure
    .input(z.object({
      goalIds: z.array(z.string()).min(1, "At least one goal required")
    }))
    .mutation(async ({ ctx, input }) => {
      return await reorderGoals(input.goalIds, ctx.session.userId);
    }),

  createSubGoal: protectedProcedure
    .input(createSubGoalValidator)
    .mutation(async ({ ctx, input }) => {
      return await createSubGoal(input, ctx.session.userId);
    }),

  updateSubGoal: protectedProcedure
    .input(updateSubGoalValidator)
    .mutation(async ({ ctx, input }) => {
      return await updateSubGoal(input, ctx.session.userId);
    }),

  deleteSubGoal: protectedProcedure
    .input(deleteSubGoalValidator)
    .mutation(async ({ ctx, input }) => {
      return await deleteSubGoal(input.id, ctx.session.userId);
    }),

  createTask: protectedProcedure
    .input(createGoalTaskValidator)
    .mutation(async ({ ctx, input }) => {
      return await createGoalTask(input, ctx.session.userId);
    }),

  updateTask: protectedProcedure
    .input(updateGoalTaskValidator)
    .mutation(async ({ ctx, input }) => {
      return await updateGoalTask(input, ctx.session.userId);
    }),

  deleteTask: protectedProcedure
    .input(deleteGoalTaskValidator)
    .mutation(async ({ ctx, input }) => {
      return await deleteGoalTask(input.id, ctx.session.userId);
    }),

  markTaskCompleted: protectedProcedure
    .input(z.object({
      taskId: z.string(),
      isCompleted: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      return await markTaskCompleted(input.taskId, input.isCompleted, ctx.session.userId);
    }),

  checkCreateGoalLimits: protectedProcedure
    .input(z.object({
      goalType: z.enum(["annual", "quarterly", "monthly"])
    }))
    .query(async ({ ctx, input }) => {
      const { SubscriptionLimitsService } = await import("@/server/services/subscription-limits");
      return await SubscriptionLimitsService.canCreateGoal(ctx.session.userId, input.goalType);
    }),

  getAllGoalLimits: protectedProcedure
    .query(async ({ ctx }) => {
      const { SubscriptionLimitsService } = await import("@/server/services/subscription-limits");
      return await SubscriptionLimitsService.getAllGoalLimits(ctx.session.userId);
    }),
}); 