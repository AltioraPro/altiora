import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateGoalValidator } from "../validators";

export const updateGoalBase = protectedProcedure.input(updateGoalValidator);

export const updateGoalHandler = updateGoalBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { id, ...updateData } = input;

        const [updatedGoal] = await db
            .update(goals)
            .set({
                ...updateData,
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
