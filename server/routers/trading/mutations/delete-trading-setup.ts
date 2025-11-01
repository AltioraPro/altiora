import { and, eq } from "drizzle-orm";
import { tradingSetups } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { idSchema } from "../validators";

export const deleteTradingSetupBase = protectedProcedure.input(idSchema);

export const deleteTradingSetupHandler = deleteTradingSetupBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        await db
            .delete(tradingSetups)
            .where(
                and(
                    eq(tradingSetups.id, input.id),
                    eq(tradingSetups.userId, userId)
                )
            );

        return { success: true };
    }
);
