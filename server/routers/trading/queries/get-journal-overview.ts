import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import {
    advancedTrades,
    confirmations,
    tradingAssets,
    tradingJournals,
    tradingSessions,
} from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { journalIdSchema } from "../validators";

export const getJournalOverviewBase = protectedProcedure.input(journalIdSchema);

export const getJournalOverviewHandler = getJournalOverviewBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const [journal] = await db
            .select()
            .from(tradingJournals)
            .where(
                and(
                    eq(tradingJournals.id, input.journalId),
                    eq(tradingJournals.userId, userId)
                )
            )
            .limit(1);

        if (!journal) {
            throw new ORPCError("NOT_FOUND", {
                message: "Trading journal not found",
            });
        }

        const [assets, sessions, setups, trades] = await Promise.all([
            db
                .select()
                .from(tradingAssets)
                .where(
                    and(
                        eq(tradingAssets.journalId, input.journalId),
                        eq(tradingAssets.isActive, true)
                    )
                )
                .orderBy(tradingAssets.name),

            db
                .select()
                .from(tradingSessions)
                .where(
                    and(
                        eq(tradingSessions.journalId, input.journalId),
                        eq(tradingSessions.isActive, true)
                    )
                )
                .orderBy(tradingSessions.name),

            db
                .select()
                .from(confirmations)
                .where(
                    and(
                        eq(confirmations.journalId, input.journalId),
                        eq(confirmations.isActive, true)
                    )
                )
                .orderBy(confirmations.name),

            db
                .select()
                .from(advancedTrades)
                .where(eq(advancedTrades.journalId, input.journalId))
                .orderBy(desc(advancedTrades.tradeDate))
                .limit(10),
        ]);

        return {
            journal,
            assets,
            sessions,
            setups,
            recentTrades: trades,
        };
    }
);
