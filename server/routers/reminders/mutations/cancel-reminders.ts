import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { GoalRemindersService } from "@/server/services/goal-reminders";
import { cancelRemindersSchema } from "../validators";

export const cancelRemindersBase = protectedProcedure.input(
    cancelRemindersSchema
);

export const cancelRemindersHandler = cancelRemindersBase.handler(
    async ({ input }) => {
        const { goalId } = input;

        await GoalRemindersService.cancelReminders(goalId);

        return {
            success: true,
            message: "Reminders cancelled successfully",
        };
    }
);
