import { and, eq } from "drizzle-orm";
import { goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { deleteGoalValidator } from "../validators";

export const deleteGoalBase = protectedProcedure.input(deleteGoalValidator);

export const deleteGoalHandler = deleteGoalBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { id } = input;

        await db
            .delete(goals)
            .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)));

        return { success: true, message: "Goal deleted successfully" };
    }
);
