import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { habits } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateHabitSchema } from "../validators";

export const updateHabitBase = protectedProcedure.input(updateHabitSchema);

export const updateHabitHandler = updateHabitBase.handler(
    async ({ context, input }) => {
        try {
            const { db, session } = context;
            const userId = session.user.id;
            const { id, ...updateData } = input;

            const existingHabit = await db
                .select()
                .from(habits)
                .where(and(eq(habits.id, id), eq(habits.userId, userId)))
                .limit(1);

            if (existingHabit.length === 0) {
                throw new ORPCError("NOT_FOUND", {
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
            if (error instanceof ORPCError) {
                throw error;
            }
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to update habit",
            });
        }
    }
);
