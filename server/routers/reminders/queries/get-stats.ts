import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { GoalRemindersService } from "@/server/services/goal-reminders";

export const getStatsBase = protectedProcedure;

export const getStatsHandler = getStatsBase.handler(async ({ context }) => {
    const { session } = context;

    return await GoalRemindersService.getReminderStats(session.user.id);
});
