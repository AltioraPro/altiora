import { ORPCError } from "@orpc/server";
import { nanoid } from "nanoid";
import { tryCatch } from "@/lib/try-catch";
import { goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createGoalsValidator } from "../validators";

export const createGoalsBase = protectedProcedure.input(createGoalsValidator);

export const createGoalsHandler = createGoalsBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;

        const newGoals = input.map((goal) => ({
            id: nanoid(),
            userId: session.user.id,
            title: goal.title,
            description: goal.description ?? null,
            type: goal.type,
            goalType: goal.goalType,
            targetValue: goal.targetValue ?? null,
            currentValue: goal.currentValue ?? "0",
            unit: goal.unit ?? null,
            deadline: goal.deadline ?? null,
            remindersEnabled: goal.remindersEnabled,
            reminderFrequency: goal.reminderFrequency ?? null,
            sortOrder: goal.sortOrder ?? null,
            isActive: true,
            isCompleted: false,
            lastReminderSent: null,
            nextReminderDate: null,
        }));

        const [error] = await tryCatch(db.insert(goals).values(newGoals));

        if (error) {
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to create goals",
            });
        }

        return;
    }
);
