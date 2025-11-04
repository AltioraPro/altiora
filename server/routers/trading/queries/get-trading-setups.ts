import { and, eq, inArray } from "drizzle-orm";
import { tradingSetups } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { journalIdsSchema } from "../validators";

export const getTradingSetupsBase = protectedProcedure.input(journalIdsSchema);

export const getTradingSetupsHandler = getTradingSetupsBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const whereConditions = [
            eq(tradingSetups.userId, userId),
            eq(tradingSetups.isActive, true),
        ];

        if (input.journalId) {
            whereConditions.push(eq(tradingSetups.journalId, input.journalId));
        } else if (input.journalIds && input.journalIds.length > 0) {
            whereConditions.push(
                inArray(tradingSetups.journalId, input.journalIds)
            );
        }

        const setups = await db
            .select()
            .from(tradingSetups)
            .where(and(...whereConditions))
            .orderBy(tradingSetups.name);

        return setups;
    }
);
