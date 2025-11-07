import { and, eq } from "drizzle-orm";
import { goalTasks } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { deleteGoalTaskValidator } from "../validators";

export const deleteGoalTaskBase = protectedProcedure.input(
    deleteGoalTaskValidator
);

export const deleteGoalTaskHandler = deleteGoalTaskBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { id } = input;

        await db
            .delete(goalTasks)
            .where(
                and(eq(goalTasks.id, id), eq(goalTasks.userId, session.user.id))
            );

        return { success: true, message: "Task deleted successfully" };
    }
);
