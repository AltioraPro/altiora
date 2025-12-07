import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { GoalRemindersService } from "@/server/services/goal-reminders";

export const processRemindersBase = protectedProcedure;

export const processRemindersHandler = processRemindersBase.handler(
    async () => {
        await GoalRemindersService.sendOverdueReminders();

        return {
            success: true,
            message: "Reminders processed successfully",
        };
    }
);
