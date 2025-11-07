import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { habitCompletions, habits } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { deleteHabitSchema } from "../validators";

export const deleteHabitBase = protectedProcedure.input(deleteHabitSchema);

export const deleteHabitHandler = deleteHabitBase.handler(
    async ({ context, input }) => {
        try {
            const { db, session } = context;
            const userId = session.user.id;
            const { id } = input;

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

            await db
                .delete(habitCompletions)
                .where(
                    and(
                        eq(habitCompletions.habitId, id),
                        eq(habitCompletions.userId, userId)
                    )
                );

            await db
                .delete(habits)
                .where(and(eq(habits.id, id), eq(habits.userId, userId)));

            return { success: true, message: "Habit deleted successfully" };
        } catch (error) {
            console.error("Error deleteHabit:", error);
            if (error instanceof ORPCError) {
                throw error;
            }
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to delete habit",
            });
        }
    }
);
