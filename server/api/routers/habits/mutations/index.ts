import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/server/db";
import { habits, habitCompletions, users } from "@/server/db/schema";
import {
  createHabitValidator,
  updateHabitValidator,
  deleteHabitValidator,
  toggleHabitCompletionValidator,
} from "../validators";

// Fonction pour calculer le rank basé sur les statistiques
async function calculateAndUpdateRank(userId: string) {
  try {
    // Récupérer les statistiques actuelles de l'utilisateur
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        rank: true,
      },
    });

    if (!user) return;

    // Récupérer les completions récentes
    const recentCompletions = await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.userId, userId),
          eq(habitCompletions.isCompleted, true)
        )
      )
      .orderBy(habitCompletions.completionDate);

    // Calculer le streak actuel (logique simplifiée)
    let currentStreak = 0;
    const currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = checkDate.toISOString().split('T')[0]!;
      
      const hasCompletion = recentCompletions.some(
        completion => completion.completionDate === dateStr
      );
      
      if (hasCompletion) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Déterminer le nouveau rank basé sur le streak
    let newRank = "NEW";
    if (currentStreak >= 365) newRank = "IMMORTAL";
    else if (currentStreak >= 180) newRank = "GRANDMASTER";
    else if (currentStreak >= 90) newRank = "MASTER";
    else if (currentStreak >= 30) newRank = "LEGEND";
    else if (currentStreak >= 14) newRank = "EXPERT";
    else if (currentStreak >= 7) newRank = "CHAMPION";
    else if (currentStreak >= 3) newRank = "RISING";
    else if (currentStreak >= 1) newRank = "BEGINNER";

    // Mettre à jour le rank seulement s'il a changé
    if (newRank !== user.rank) {
      await db
        .update(users)
        .set({
          rank: newRank,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  } catch (error) {
    console.error("Erreur lors du calcul du rank:", error);
  }
}

export const createHabit = async (
  input: z.infer<typeof createHabitValidator>,
  userId: string
) => {
  try {
    const habitId = createId();
    
    const [newHabit] = await db
      .insert(habits)
      .values({
        id: habitId,
        userId,
        ...input,
      })
      .returning();

    if (!newHabit) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create habit",
      });
    }

    return newHabit;
  } catch (error) {
    console.error("Error createHabit:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create habit",
    });
  }
};

export const updateHabit = async (
  input: z.infer<typeof updateHabitValidator>,
  userId: string
) => {
  try {
    const { id, ...updateData } = input;

    const existingHabit = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .limit(1);

    if (existingHabit.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Habit not found",
      });
    }

    const [updatedHabit] = await db
      .update(habits)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();

    return updatedHabit;
  } catch (error) {
    console.error("Error updateHabit:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update habit",
    });
  }
};

export const deleteHabit = async (
  input: z.infer<typeof deleteHabitValidator>,
  userId: string
) => {
  try {
    const { id } = input;

    const existingHabit = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .limit(1);

    if (existingHabit.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Habit not found",
      });
    }

    await db
      .delete(habitCompletions)
      .where(and(eq(habitCompletions.habitId, id), eq(habitCompletions.userId, userId)));

    await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));

    return { success: true, message: "Habit deleted successfully" };
  } catch (error) {
    console.error("Error deleteHabit:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete habit",
    });
  }
};
    
export const toggleHabitCompletion = async (
  input: z.infer<typeof toggleHabitCompletionValidator>,
  userId: string
) => {
  try {
    const { habitId, completionDate, isCompleted, notes } = input;

    //requete unique plus opti imo ?
    const existingHabit = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
      .limit(1);

    if (existingHabit.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Habit not found",
      });
    }

    // Vérifier si une completion existe déjà pour cette date
    const existingCompletion = await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.userId, userId),
          eq(habitCompletions.habitId, habitId),
          eq(habitCompletions.completionDate, completionDate)
        )
      )
      .limit(1);

    let completion;

    if (existingCompletion.length > 0) {
      // Mettre à jour l'enregistrement existant
      [completion] = await db
        .update(habitCompletions)
        .set({
          isCompleted,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(habitCompletions.id, existingCompletion[0]!.id))
        .returning();
    } else {
      // Créer un nouvel enregistrement
      const completionId = createId();
      [completion] = await db
        .insert(habitCompletions)
        .values({
          id: completionId,
          userId,
          habitId,
          completionDate,
          isCompleted,
          notes,
        })
        .returning();
    }

    // Calculer et mettre à jour le rank après chaque completion
    await calculateAndUpdateRank(userId);

    return completion;
  } catch (error) {
    console.error("Error toggleHabitCompletion:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update completion",
    });
  }
};

export { updateUserRank } from "./updateUserRank"; 