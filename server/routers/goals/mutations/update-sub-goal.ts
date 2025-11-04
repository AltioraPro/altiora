import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { subGoals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateSubGoalValidator } from "../validators";

export const updateSubGoalBase = protectedProcedure.input(
    updateSubGoalValidator
);

export const updateSubGoalHandler = updateSubGoalBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { id, ...updateData } = input;

        const [updatedSubGoal] = await db
            .update(subGoals)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(
                and(eq(subGoals.id, id), eq(subGoals.userId, session.user.id))
            )
            .returning();

        if (!updatedSubGoal) {
            throw new ORPCError("NOT_FOUND", {
                message: "Sub-goal not found",
            });
        }

        return updatedSubGoal;
    }
);
