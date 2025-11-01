import { nanoid } from "nanoid";
import { goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createGoalValidator } from "../validators";

export const createGoalBase = protectedProcedure.input(createGoalValidator);

export const createGoalHandler = createGoalBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const goalId = nanoid();

        const newGoal = {
            id: goalId,
            userId: session.user.id,
            title: input.title,
            description: input.description ?? null,
            type: input.type,
            goalType: input.goalType,
            targetValue: input.targetValue ?? null,
            currentValue: input.currentValue ?? "0",
            unit: input.unit ?? null,
            deadline: input.deadline ?? null,
            remindersEnabled: input.remindersEnabled,
            reminderFrequency: input.reminderFrequency ?? null,
            sortOrder: input.sortOrder ?? null,
            isActive: true,
            isCompleted: false,
            lastReminderSent: null,
            nextReminderDate: null,
        };

        const [createdGoal] = await db
            .insert(goals)
            .values(newGoal)
            .returning();

        return createdGoal;
    }
);
