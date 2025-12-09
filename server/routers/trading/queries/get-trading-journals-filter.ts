import { eq } from "drizzle-orm";
import { tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const getTradingJournalsFilterBase = protectedProcedure;

export const getTradingJournalsFilterHandler =
    getTradingJournalsFilterBase.handler(async ({ context }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const journals = await db.query.tradingJournals.findMany({
            where: eq(tradingJournals.userId, userId),
            columns: {
                id: true,
                name: true,
            },
        });

        return journals;
    });
