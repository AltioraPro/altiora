import { db } from "@/server/db";
import { goals, subGoals, goalTasks, goalReminders, users } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { type NewGoal, type NewSubGoal, type NewGoalTask } from "@/server/db/schema";
import { nanoid } from "nanoid";
import { DiscordService } from "@/server/services/discord";

export async function createGoal(input: Omit<NewGoal, 'id' | 'userId'>, userId: string) {
  const goalId = nanoid();
  
  const newGoal = {
    id: goalId,
    userId,
    ...input,
    currentValue: input.currentValue || "0",
  };

  const [createdGoal] = await db
    .insert(goals)
    .values(newGoal)
    .returning();

  return createdGoal;
}

export async function updateGoal(input: Partial<NewGoal> & { id: string }, userId: string) {
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

export async function markGoalCompleted(goalId: string, isCompleted: boolean, userId: string) {
  const [updatedGoal] = await db
    .update(goals)
    .set({
      isCompleted,
      updatedAt: new Date(),
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();

  // Si l'objectif vient d'être marqué comme complété, envoyer un DM de félicitations
  if (isCompleted && updatedGoal) {
    try {
      // Récupérer les informations de l'utilisateur pour Discord
      const [user] = await db
        .select({
          discordId: users.discordId,
          discordConnected: users.discordConnected,
        })
        .from(users)
        .where(eq(users.id, userId));

      // Envoyer le DM de félicitations si l'utilisateur est connecté à Discord
      if (user?.discordId && user?.discordConnected) {
        await DiscordService.sendGoalCompletion(user.discordId, {
          id: updatedGoal.id,
          title: updatedGoal.title,
          description: updatedGoal.description,
          deadline: updatedGoal.deadline,
          userId: updatedGoal.userId,
        });
        console.log(`🎉 [Goal Completion] DM de félicitations envoyé pour l'objectif: ${updatedGoal.title}`);
      }
    } catch (error) {
      console.error(`❌ [Goal Completion] Erreur lors de l'envoi du DM de félicitations:`, error);
      // Ne pas faire échouer la fonction si l'envoi du DM échoue
    }
  }

  return updatedGoal;
}

export async function updateGoalProgress(goalId: string, currentValue: string, userId: string) {
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

// Sous-objectifs
export async function createSubGoal(input: Omit<NewSubGoal, 'id' | 'userId'>, userId: string) {
  const subGoalId = nanoid();
  
  const newSubGoal = {
    id: subGoalId,
    userId,
    ...input,
  };

  const [createdSubGoal] = await db
    .insert(subGoals)
    .values(newSubGoal)
    .returning();

  return createdSubGoal;
}

export async function updateSubGoal(input: Partial<NewSubGoal> & { id: string }, userId: string) {
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

// Tâches
export async function createGoalTask(input: Omit<NewGoalTask, 'id' | 'userId'>, userId: string) {
  const taskId = nanoid();
  
  const newTask = {
    id: taskId,
    userId,
    ...input,
  };

  const [createdTask] = await db
    .insert(goalTasks)
    .values(newTask)
    .returning();

  return createdTask;
}

export async function updateGoalTask(input: Partial<NewGoalTask> & { id: string }, userId: string) {
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

export async function markTaskCompleted(taskId: string, isCompleted: boolean, userId: string) {
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

export async function updateNextReminderDate(goalId: string, nextDate: Date, userId: string) {
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