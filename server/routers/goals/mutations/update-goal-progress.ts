import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateGoalProgressValidator } from "../validators";

export const updateGoalProgressBase = protectedProcedure.input(
    updateGoalProgressValidator
);

export const updateGoalProgressHandler = updateGoalProgressBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { id, currentValue } = input;

        const [updatedGoal] = await db
            .update(goals)
            .set({
                currentValue,
                updatedAt: new Date(),
            })
            .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
            .returning();

        if (!updatedGoal) {
            throw new ORPCError("NOT_FOUND", {
                message: "Goal not found",
            });
        }

        return updatedGoal;
    }
);
