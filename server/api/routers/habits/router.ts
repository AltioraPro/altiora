import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import { 
  createHabitValidator,
  updateHabitValidator, 
  deleteHabitValidator,
  toggleHabitCompletionValidator,
  getHabitStatsValidator,
  getHabitsPaginatedValidator,
  getDashboardValidator
} from "./validators";
import { 
  createHabit, 
  updateHabit, 
  deleteHabit, 
  toggleHabitCompletion,
  updateUserRank
} from "./mutations";
import { 
  getUserHabits, 
  getDailyStats, 
  getHabitStats, 
  getHabitsDashboard,
  getHabitsPaginated
} from "./queries";

export const habitsRouter = createTRPCRouter({
  
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserHabits(ctx.session.userId);
    }),

  getPaginated: protectedProcedure
    .input(getHabitsPaginatedValidator)
    .query(async ({ ctx, input }) => {
      return await getHabitsPaginated(ctx.session.userId, input);
    }),

  getDashboard: protectedProcedure
    .input(getDashboardValidator)
    .query(async ({ ctx, input }) => {
      return await getHabitsDashboard(ctx.session.userId, input);
    }),

  getDailyStats: protectedProcedure
    .input(z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    }))
    .query(async ({ ctx, input }) => {
      return await getDailyStats(ctx.session.userId, input.date);
    }),

  getStats: protectedProcedure
    .input(getHabitStatsValidator)
    .query(async ({ ctx, input }) => {
      return await getHabitStats(ctx.session.userId, input);
    }),


  create: protectedProcedure
    .input(createHabitValidator)
    .mutation(async ({ ctx, input }) => {
      return await createHabit(input, ctx.session.userId);
    }),

  update: protectedProcedure
    .input(updateHabitValidator)
    .mutation(async ({ ctx, input }) => {
      return await updateHabit(input, ctx.session.userId);
    }),

  delete: protectedProcedure
    .input(deleteHabitValidator)
    .mutation(async ({ ctx, input }) => {
      return await deleteHabit(input, ctx.session.userId);
    }),

  toggleCompletion: protectedProcedure
    .input(toggleHabitCompletionValidator)
    .mutation(async ({ ctx, input }) => {
      return await toggleHabitCompletion(input, ctx.session.userId);
    }),

  reorder: protectedProcedure
    .input(z.object({
      habitIds: z.array(z.string()).min(1, "At least one habit required")
    }))
    .mutation(async ({ ctx, input }) => {
      const { habitIds } = input;

      const updatePromises = habitIds.map((habitId, index) =>
        updateHabit({ id: habitId, sortOrder: index }, ctx.session.userId)
      );

      await Promise.all(updatePromises);
      
      return { success: true, message: "Habit order updated" };
    }),

  updateRank: protectedProcedure
    .mutation(async ({ ctx }) => {
      return await updateUserRank(ctx.session.userId);
    }),
}); 