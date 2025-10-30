import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { z } from "zod";
import { db } from "@/server/db";
import {
    discordProfile,
    type Goal,
    type GoalTask,
    goalReminders,
    goals,
    goalTasks,
    type SubGoal,
    subGoals,
    user,
} from "@/server/db/schema";
import { DiscordService } from "@/server/services/discord";
import type {
    createGoalTaskValidator,
    createGoalValidator,
    createSubGoalValidator,
} from "../validators";

export async function createGoal(
    input: z.infer<typeof createGoalValidator>,
    userId: string
) {
    const goalId = nanoid();

    const newGoal = {
        id: goalId,
        userId,
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

    const [createdGoal] = await db.insert(goals).values(newGoal).returning();

    return createdGoal;
}

export async function updateGoal(
    input: Partial<Goal> & { id: string },
    userId: string
) {
    const { id, ...updateData } = input;

    const [updatedGoal] = await db
        .update(goals)
        .set({
            ...updateData,
            updatedAt: new Date(),
        })
        .where(and(eq(goals.id, id), eq(goals.userId, userId)))
        .returning();

    return updatedGoal;
}

export async function deleteGoal(goalId: string, userId: string) {
    await db
        .delete(goals)
        .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

    return { success: true, message: "Goal deleted successfully" };
}

export async function markGoalCompleted(
    goalId: string,
    isCompleted: boolean,
    userId: string
) {
    const [updatedGoal] = await db
        .update(goals)
        .set({
            isCompleted,
            updatedAt: new Date(),
        })
        .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
        .returning();

    if (isCompleted && updatedGoal) {
        try {
            const [userData] = await db
                .select({
                    discordId: discordProfile.discordId,
                    discordConnected: discordProfile.discordConnected,
                })
                .from(user)
                .leftJoin(discordProfile, eq(user.id, discordProfile.userId))
                .where(eq(user.id, userId));

            if (userData?.discordId && userData?.discordConnected) {
                await DiscordService.sendGoalCompletion(userData.discordId, {
                    id: updatedGoal.id,
                    title: updatedGoal.title,
                    description: updatedGoal.description,
                    deadline: updatedGoal.deadline,
                    userId: updatedGoal.userId,
                });
            }
        } catch (error) {
            console.error("Error::", error);
        }
    }

    return updatedGoal;
}

export async function updateGoalProgress(
    goalId: string,
    currentValue: string,
    userId: string
) {
    const [updatedGoal] = await db
        .update(goals)
        .set({
            currentValue,
            updatedAt: new Date(),
        })
        .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
        .returning();

    return updatedGoal;
}

export async function reorderGoals(goalIds: string[], userId: string) {
    const updatePromises = goalIds.map((goalId, index) =>
        updateGoal({ id: goalId, sortOrder: index }, userId)
    );

    await Promise.all(updatePromises);

    return { success: true, message: "Goals reordered successfully" };
}

export async function createSubGoal(
    input: z.infer<typeof createSubGoalValidator>,
    userId: string
) {
    const subGoalId = nanoid();

    const newSubGoal = {
        id: subGoalId,
        userId,
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

export async function updateSubGoal(
    input: Partial<SubGoal> & { id: string },
    userId: string
) {
    const { id, ...updateData } = input;

    const [updatedSubGoal] = await db
        .update(subGoals)
        .set({
            ...updateData,
            updatedAt: new Date(),
        })
        .where(and(eq(subGoals.id, id), eq(subGoals.userId, userId)))
        .returning();

    return updatedSubGoal;
}

export async function deleteSubGoal(subGoalId: string, userId: string) {
    await db
        .delete(subGoals)
        .where(and(eq(subGoals.id, subGoalId), eq(subGoals.userId, userId)));

    return { success: true, message: "Sub-goal deleted successfully" };
}

export async function createGoalTask(
    input: z.infer<typeof createGoalTaskValidator>,
    userId: string
) {
    const taskId = nanoid();

    const newTask = {
        id: taskId,
        userId,
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

export async function updateGoalTask(
    input: Partial<GoalTask> & { id: string },
    userId: string
) {
    const { id, ...updateData } = input;

    const [updatedTask] = await db
        .update(goalTasks)
        .set({
            ...updateData,
            updatedAt: new Date(),
        })
        .where(and(eq(goalTasks.id, id), eq(goalTasks.userId, userId)))
        .returning();

    return updatedTask;
}

export async function deleteGoalTask(taskId: string, userId: string) {
    await db
        .delete(goalTasks)
        .where(and(eq(goalTasks.id, taskId), eq(goalTasks.userId, userId)));

    return { success: true, message: "Task deleted successfully" };
}

export async function markTaskCompleted(
    taskId: string,
    isCompleted: boolean,
    userId: string
) {
    const [updatedTask] = await db
        .update(goalTasks)
        .set({
            isCompleted,
            updatedAt: new Date(),
        })
        .where(and(eq(goalTasks.id, taskId), eq(goalTasks.userId, userId)))
        .returning();

    return updatedTask;
}

// Rappels
export async function createGoalReminder(
    goalId: string,
    userId: string,
    reminderType: "email" | "push" | "discord"
) {
    const reminderId = nanoid();

    const newReminder = {
        id: reminderId,
        goalId,
        userId,
        reminderType,
        sentAt: new Date(),
        status: "sent",
    };

    const [createdReminder] = await db
        .insert(goalReminders)
        .values(newReminder)
        .returning();

    return createdReminder;
}

export async function updateNextReminderDate(
    goalId: string,
    nextDate: Date,
    userId: string
) {
    const [updatedGoal] = await db
        .update(goals)
        .set({
            lastReminderSent: new Date(),
            nextReminderDate: nextDate,
            updatedAt: new Date(),
        })
        .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
        .returning();

    return updatedGoal;
}
