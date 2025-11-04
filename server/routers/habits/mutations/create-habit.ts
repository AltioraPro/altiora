import { ORPCError } from "@orpc/client";
import { createId } from "@paralleldrive/cuid2";
import { habits } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createHabitSchema } from "../validators";

export const createHabitBase = protectedProcedure.input(createHabitSchema);

export const createHabitHandler = createHabitBase.handler(
    async ({ context, input }) => {
        try {
            const { db, session } = context;
            const userId = session.user.id;

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
                throw new ORPCError("INTERNAL_SERVER_ERROR", {
                    message: "Failed to create habit",
                });
            }

            return newHabit;
        } catch (error) {
            console.error("Error createHabit:", error);
            if (error instanceof ORPCError) {
                throw error;
            }
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to create habit",
            });
        }
    }
);
