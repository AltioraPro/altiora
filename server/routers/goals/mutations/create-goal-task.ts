import { nanoid } from "nanoid";
import { goalTasks } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createGoalTaskValidator } from "../validators";

export const createGoalTaskBase = protectedProcedure.input(
    createGoalTaskValidator
);

export const createGoalTaskHandler = createGoalTaskBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const taskId = nanoid();

        const newTask = {
            id: taskId,
            userId: session.user.id,
            goalId: input.goalId,
            title: input.title,
            description: input.description ?? null,
            dueDate: input.dueDate ?? null,
            priority: input.priority ?? null,
            sortOrder: input.sortOrder ?? null,
            isCompleted: false,
        };

        const [createdTask] = await db
            .insert(goalTasks)
            .values(newTask)
            .returning();

        return createdTask;
    }
);
