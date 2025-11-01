import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { GoalRemindersService } from "@/server/services/goal-reminders";
import { scheduleReminderSchema } from "../validators";

export const scheduleReminderBase =
    protectedProcedure.input(scheduleReminderSchema);

export const scheduleReminderHandler = scheduleReminderBase.handler(
    async ({ input }) => {
        const { goalId, frequency } = input;

        await GoalRemindersService.scheduleReminder(goalId, frequency);

        return {
            success: true,
            message: "Reminder scheduled successfully",
        };
    }
);
