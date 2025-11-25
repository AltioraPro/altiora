import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { GoalRemindersService } from "@/server/services/goal-reminders";
import { scheduleReminderSchema } from "../validators";

export const scheduleReminderBase =
    protectedProcedure.input(scheduleReminderSchema);

export const scheduleReminderHandler = scheduleReminderBase.handler(
    async ({ input, context }) => {
        const { goalId, frequency } = input;
        const { session } = context;

        await GoalRemindersService.scheduleReminder(goalId, frequency, session.user.id);

        return {
            success: true,
            message: "Reminder scheduled successfully",
        };
    }
);
