import { and, desc, eq } from "drizzle-orm";
import { tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const getTradingJournalsBase = protectedProcedure;

export const getTradingJournalsHandler = getTradingJournalsBase.handler(
    async ({ context }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const journals = await db
            .select()
            .from(tradingJournals)
            .where(
                and(
                    eq(tradingJournals.userId, userId),
                    eq(tradingJournals.isActive, true)
                )
            )
            .orderBy(tradingJournals.order, desc(tradingJournals.createdAt));

        return journals;
    }
);
