import { ORPCError } from "@orpc/client";
import { and, asc, eq } from "drizzle-orm";
import { advancedTrades, tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { journalIdSchema } from "../validators";

export const getCurrentCapitalBase = protectedProcedure.input(journalIdSchema);

export const getCurrentCapitalHandler = getCurrentCapitalBase.handler(
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

        if (!(journal.usePercentageCalculation && journal.startingCapital)) {
            return { currentCapital: null, startingCapital: null };
        }

        const startingCapital = Number.parseFloat(journal.startingCapital);

        const closedTradesData = await db
            .select({
                profitLossPercentage: advancedTrades.profitLossPercentage,
            })
            .from(advancedTrades)
            .where(
                and(
                    eq(advancedTrades.journalId, input.journalId),
                    eq(advancedTrades.userId, userId),
                    eq(advancedTrades.isClosed, true)
                )
            )
            .orderBy(asc(advancedTrades.tradeDate));

        const totalPnLPercentage = closedTradesData.reduce((sum, trade) => {
            const pnlPercentage = Number(trade.profitLossPercentage);
            return sum + pnlPercentage;
        }, 0);

        const currentCapital =
            startingCapital + (totalPnLPercentage / 100) * startingCapital;

        const result = {
            currentCapital: currentCapital.toFixed(2),
            startingCapital: startingCapital.toFixed(2),
        };

        return result;
    }
);
