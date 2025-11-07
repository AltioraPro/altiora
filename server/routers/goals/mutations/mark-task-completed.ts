import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { goalTasks } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { markTaskCompletedValidator } from "../validators";

export const markTaskCompletedBase = protectedProcedure.input(
    markTaskCompletedValidator
);

export const markTaskCompletedHandler = markTaskCompletedBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { taskId, isCompleted } = input;

        const [updatedTask] = await db
            .update(goalTasks)
            .set({
                isCompleted,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(goalTasks.id, taskId),
                    eq(goalTasks.userId, session.user.id)
                )
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
