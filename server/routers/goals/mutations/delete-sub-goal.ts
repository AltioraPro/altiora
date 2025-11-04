import { and, eq } from "drizzle-orm";
import { subGoals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { deleteSubGoalValidator } from "../validators";

export const deleteSubGoalBase = protectedProcedure.input(
    deleteSubGoalValidator
);

export const deleteSubGoalHandler = deleteSubGoalBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { id } = input;

        await db
            .delete(subGoals)
            .where(
                and(eq(subGoals.id, id), eq(subGoals.userId, session.user.id))
            );

        return { success: true, message: "Sub-goal deleted successfully" };
    }
);
