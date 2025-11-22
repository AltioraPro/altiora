import { and, eq } from "drizzle-orm";
import { confirmations } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { idSchema } from "../validators";

export const deleteConfirmationBase = protectedProcedure.input(idSchema);

export const deleteConfirmationHandler = deleteConfirmationBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        await db
            .delete(confirmations)
            .where(
                and(
                    eq(confirmations.id, input.id),
                    eq(confirmations.userId, userId)
                )
            );

        return;
    }
);
