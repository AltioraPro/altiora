import { and, eq } from "drizzle-orm";
import { goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { reorderGoalsValidator } from "../validators";

export const reorderGoalsBase = protectedProcedure.input(reorderGoalsValidator);

export const reorderGoalsHandler = reorderGoalsBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { goalIds } = input;

        const updatePromises = goalIds.map((goalId, index) =>
            db
                .update(goals)
                .set({
                    sortOrder: index,
                    updatedAt: new Date(),
                })
                .where(
                    and(eq(goals.id, goalId), eq(goals.userId, session.user.id))
                )
                .returning()
        );

        await Promise.all(updatePromises);

        return { success: true, message: "Goals reordered successfully" };
    }
);
