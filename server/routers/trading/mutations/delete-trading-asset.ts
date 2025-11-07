import { and, eq } from "drizzle-orm";
import { tradingAssets } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { idSchema } from "../validators";

export const deleteTradingAssetBase = protectedProcedure.input(idSchema);

export const deleteTradingAssetHandler = deleteTradingAssetBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        await db
            .delete(tradingAssets)
            .where(
                and(
                    eq(tradingAssets.id, input.id),
                    eq(tradingAssets.userId, userId)
                )
            );

        return { success: true };
    }
);
