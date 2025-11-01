import { ORPCError } from "@orpc/client";
import { and, asc, eq } from "drizzle-orm";
import { advancedTrades, tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { calculateTradeResults } from "@/server/services/trade-calculation";
import { updateAdvancedTradeSchema } from "../validators";

export const updateAdvancedTradeBase = protectedProcedure.input(
    updateAdvancedTradeSchema
);

export const updateAdvancedTradeHandler = updateAdvancedTradeBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;
        const { id, ...updateData } = input;

        const existingTrade = await db
            .select()
            .from(advancedTrades)
            .where(
                and(
                    eq(advancedTrades.id, id),
                    eq(advancedTrades.userId, userId)
                )
            )
            .limit(1);

        if (!existingTrade.length) {
            throw new ORPCError("NOT_FOUND", {
                message: "Trade not found",
            });
        }

        const journal = await db
            .select()
            .from(tradingJournals)
            .where(
                and(
                    eq(tradingJournals.id, existingTrade[0].journalId),
                    eq(tradingJournals.userId, userId)
                )
            )
            .limit(1);

        if (!journal.length) {
            throw new ORPCError("NOT_FOUND", {
                message: "Trading journal not found",
            });
        }

        let currentCapital: number | undefined;
        if (journal[0].usePercentageCalculation && journal[0].startingCapital) {
            const startingCapital = Number.parseFloat(
                journal[0].startingCapital
            );

            const closedTradesData = await db
                .select({
                    profitLossPercentage: advancedTrades.profitLossPercentage,
                })
                .from(advancedTrades)
                .where(
                    and(
                        eq(
                            advancedTrades.journalId,
                            existingTrade[0].journalId
                        ),
                        eq(advancedTrades.userId, userId),
                        eq(advancedTrades.isClosed, true)
                    )
                )
                .orderBy(asc(advancedTrades.tradeDate));

            const totalPnLPercentage = closedTradesData.reduce((sum, trade) => {
                const pnlPercentage = trade.profitLossPercentage
                    ? Number.parseFloat(trade.profitLossPercentage) || 0
                    : 0;
                return sum + pnlPercentage;
            }, 0);

            currentCapital =
                startingCapital + (totalPnLPercentage / 100) * startingCapital;
        }

        let calculatedResults = {};
        if (
            updateData.profitLossAmount !== undefined ||
            updateData.profitLossPercentage !== undefined
        ) {
            calculatedResults = calculateTradeResults(
                {
                    profitLossAmount: updateData.profitLossAmount,
                    profitLossPercentage: updateData.profitLossPercentage,
                    exitReason: updateData.exitReason,
                },
                journal[0],
                currentCapital
            );
        }

        const [updatedTrade] = await db
            .update(advancedTrades)
            .set({
                ...updateData,
                ...calculatedResults,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(advancedTrades.id, id),
                    eq(advancedTrades.userId, userId)
                )
            )
            .returning();

        return updatedTrade;
    }
);
