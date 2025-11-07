import { and, eq } from "drizzle-orm";
import { advancedTrades } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { idSchema } from "../validators";

export const deleteAdvancedTradeBase = protectedProcedure.input(idSchema);

export const deleteAdvancedTradeHandler = deleteAdvancedTradeBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        await db
            .delete(advancedTrades)
            .where(
                and(
                    eq(advancedTrades.id, input.id),
                    eq(advancedTrades.userId, userId)
                )
            );

        return { success: true };
    }
);
