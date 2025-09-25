import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { GoalRemindersService } from "@/server/services/goal-reminders";

export const remindersRouter = createTRPCRouter({

  scheduleReminder: protectedProcedure
    .input(z.object({
      goalId: z.string(),
      frequency: z.enum(["daily", "weekly", "monthly"])
    }))
    .mutation(async ({ ctx, input }) => {
      await GoalRemindersService.scheduleReminder(input.goalId, input.frequency);
      return { success: true, message: "Reminder scheduled successfully" };
    }),

  cancelReminders: protectedProcedure
    .input(z.object({
      goalId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await GoalRemindersService.cancelReminders(input.goalId);
      return { success: true, message: "Reminders cancelled successfully" };
    }),

  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      return await GoalRemindersService.getReminderStats(ctx.session.userId);
    }),

  processReminders: protectedProcedure
    .mutation(async () => {
      await GoalRemindersService.sendOverdueReminders();
      return { success: true, message: "Reminders processed successfully" };
    }),
}); 