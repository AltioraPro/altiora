import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { confirmations } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { idSchema } from "../validators";

export const getConfirmationByIdBase = protectedProcedure.input(idSchema);

export const getConfirmationByIdHandler = getConfirmationByIdBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const [setup] = await db
            .select()
            .from(confirmations)
            .where(
                and(
                    eq(confirmations.id, input.id),
                    eq(confirmations.userId, userId)
                )
            )
            .limit(1);

        if (!setup) {
            throw new ORPCError("NOT_FOUND", {
                message: "Setup not found",
            });
        }

        return setup;
    }
);
