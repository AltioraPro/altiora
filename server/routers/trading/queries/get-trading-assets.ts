import { and, eq } from "drizzle-orm";
import { tradingAssets } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { journalOptionalIdSchema } from "../validators";

export const getTradingAssetsBase = protectedProcedure.input(
    journalOptionalIdSchema
);

export const getTradingAssetsHandler = getTradingAssetsBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const whereConditions = [
            eq(tradingAssets.userId, userId),
            eq(tradingAssets.isActive, true),
        ];

        if (input.journalId) {
            whereConditions.push(eq(tradingAssets.journalId, input.journalId));
        }

        const assets = await db
            .select()
            .from(tradingAssets)
            .where(and(...whereConditions))
            .orderBy(tradingAssets.name);

        return assets;
    }
);
