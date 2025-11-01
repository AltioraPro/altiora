import { and, eq } from "drizzle-orm";
import { tradingSessions } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { idSchema } from "../validators";

export const deleteTradingSessionBase = protectedProcedure.input(idSchema);

export const deleteTradingSessionHandler = deleteTradingSessionBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        await db
            .delete(tradingSessions)
            .where(
                and(
                    eq(tradingSessions.id, input.id),
                    eq(tradingSessions.userId, userId)
                )
            );

        return { success: true };
    }
);
