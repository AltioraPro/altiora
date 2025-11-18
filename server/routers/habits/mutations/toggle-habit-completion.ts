import { ORPCError } from "@orpc/client";
import { call } from "@orpc/server";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import {
    type HabitCompletion,
    habitCompletions,
    habits,
} from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { toggleHabitCompletionSchema } from "../validators";
import { updateUserRankHandler } from "./update-user-rank";

export const toggleHabitCompletionBase = protectedProcedure.input(
    toggleHabitCompletionSchema
);

export const toggleHabitCompletionHandler = toggleHabitCompletionBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const { habitId, completionDate, isCompleted, notes } = input;

        const existingHabit = await db
            .select()
            .from(habits)
            .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
            .limit(1);

        if (existingHabit.length === 0) {
            throw new ORPCError("NOT_FOUND", {
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

        let completion: HabitCompletion | undefined;

        if (existingCompletion.length > 0) {
            [completion] = await db
                .update(habitCompletions)
                .set({
                    isCompleted,
                    notes,
                    updatedAt: new Date(),
                })
                .where(eq(habitCompletions.id, existingCompletion[0].id))
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

        await call(updateUserRankHandler, undefined, { context });

        return completion;
    }
);
