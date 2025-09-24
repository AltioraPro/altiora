import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { habits, habitCompletions } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import {
  createHabitValidator,
  updateHabitValidator,
  deleteHabitValidator,
  toggleHabitCompletionValidator,
} from "../validators";
import { updateUserRank } from "./updateUserRank";
import { SubscriptionLimitsService } from "@/server/services/subscription-limits";

export const createHabit = async (
  input: z.infer<typeof createHabitValidator>,
  userId: string
) => {
  try {
    const canCreate = await SubscriptionLimitsService.canCreateHabit(userId);
    if (!canCreate.canCreate) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: canCreate.reason || "Habit limit reached for your plan",
      });
    }

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

    await SubscriptionLimitsService.incrementMonthlyUsage(userId, "habits");

    return newHabit;
  } catch (error) {
    console.error("Error createHabit:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
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

    await updateUserRank(userId);

    return completion;
  } catch (error) {
    console.error("Error toggleHabitCompletion:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update completion",
    });
  }
};

export { updateUserRank }; 