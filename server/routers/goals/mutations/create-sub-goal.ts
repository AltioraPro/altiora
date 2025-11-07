import { nanoid } from "nanoid";
import { subGoals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createSubGoalValidator } from "../validators";

export const createSubGoalBase = protectedProcedure.input(
    createSubGoalValidator
);

export const createSubGoalHandler = createSubGoalBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const subGoalId = nanoid();

        const newSubGoal = {
            id: subGoalId,
            userId: session.user.id,
            goalId: input.goalId,
            title: input.title,
            description: input.description ?? null,
            sortOrder: input.sortOrder ?? null,
            isCompleted: false,
        };

        const [createdSubGoal] = await db
            .insert(subGoals)
            .values(newSubGoal)
            .returning();

        return createdSubGoal;
    }
);
