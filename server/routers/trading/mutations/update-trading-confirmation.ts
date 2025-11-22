import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { confirmations } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateConfirmationSchema } from "../validators";

export const updateConfirmationBase = protectedProcedure.input(
    updateConfirmationSchema
);

export const updateConfirmationHandler = updateConfirmationBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;
        const { id, ...updateData } = input;

        const [confirmation] = await db
            .update(confirmations)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(
                and(eq(confirmations.id, id), eq(confirmations.userId, userId))
            )
            .returning();

        if (!confirmation) {
            throw new ORPCError("NOT_FOUND", {
                message: "Confirmation not found",
            });
        }

        return confirmation;
    }
);
