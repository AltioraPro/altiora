import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { goalTasks } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateGoalTaskValidator } from "../validators";

export const updateGoalTaskBase = protectedProcedure.input(
    updateGoalTaskValidator
);

export const updateGoalTaskHandler = updateGoalTaskBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { id, ...updateData } = input;

        const [updatedTask] = await db
            .update(goalTasks)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(
                and(eq(goalTasks.id, id), eq(goalTasks.userId, session.user.id))
            )
            .returning();

        if (!updatedTask) {
            throw new ORPCError("NOT_FOUND", {
                message: "Task not found",
            });
        }

        return updatedTask;
    }
);
