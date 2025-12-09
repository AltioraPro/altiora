import { ORPCError } from "@orpc/client";
import { and, asc, avg, count, desc, eq, sql, sum } from "drizzle-orm";
import { advancedTrades, tradingJournals } from "@/server/db/schema/index";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { buildJournalsMap } from "../utils/build-journals-map";
import { calculateProfitFactor } from "../utils/calculate-profit-factor";
import { calculateStreaks } from "../utils/calculate-streaks";
import { calculateTotalPnL } from "../utils/calculate-total-pnl";
import { extractAggregatedStats } from "../utils/extract-aggregate-strats";
import { getJournalStartingCapital } from "../utils/get-journal-starting-capital";
import { idSchema } from "../validators";

export const getSnapshotDataBase = protectedProcedure.input(idSchema);

export const getSnapshotDataHandler = getSnapshotDataBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;
        const journalId = input.id;

        // Fetch journal details
        const [journal] = await db
            .select()
            .from(tradingJournals)
            .where(
                and(
                    eq(tradingJournals.id, journalId),
                    eq(tradingJournals.userId, userId)
                )
            )
            .limit(1);

        if (!journal) {
            throw new ORPCError("NOT_FOUND", {
                message: "Trading journal not found",
            });
        }

        // Build where conditions for trades
        const tradeWhereConditions = [
            eq(advancedTrades.userId, userId),
            eq(advancedTrades.journalId, journalId),
        ];

        // Fetch stats and trades in parallel
        const [aggregatedStats, closedTradesData, trades] = await Promise.all([
            // Aggregated stats query
            db
                .select({
                    totalTrades: count(),
                    closedTrades: sum(
                        sql`CASE WHEN ${advancedTrades.isClosed} = true THEN 1 ELSE 0 END`
                    ),
                    winningTrades: sum(
                        sql`CASE WHEN ${advancedTrades.isClosed} = true AND ${advancedTrades.exitReason} = 'TP' THEN 1 ELSE 0 END`
                    ),
                    losingTrades: sum(
                        sql`CASE WHEN ${advancedTrades.isClosed} = true AND ${advancedTrades.exitReason} = 'SL' THEN 1 ELSE 0 END`
                    ),
                    tpTrades: sum(
                        sql`CASE WHEN ${advancedTrades.exitReason} = 'TP' THEN 1 ELSE 0 END`
                    ),
                    beTrades: sum(
                        sql`CASE WHEN ${advancedTrades.exitReason} = 'BE' THEN 1 ELSE 0 END`
                    ),
                    slTrades: sum(
                        sql`CASE WHEN ${advancedTrades.exitReason} = 'SL' THEN 1 ELSE 0 END`
                    ),
                    avgPnL: avg(
                        sql`CASE 
                        WHEN ${advancedTrades.isClosed} = true 
                        AND ${advancedTrades.profitLossPercentage} IS NOT NULL 
                        AND ${advancedTrades.profitLossPercentage} != '' 
                        AND ${advancedTrades.profitLossPercentage} != 'undefined'
                        THEN CAST(${advancedTrades.profitLossPercentage} AS DECIMAL) 
                        ELSE NULL
                    END`
                    ),
                    totalAmountPnL: sum(
                        sql`CASE 
                        WHEN ${advancedTrades.isClosed} = true 
                        AND ${advancedTrades.profitLossAmount} IS NOT NULL 
                        AND ${advancedTrades.profitLossAmount} != '' 
                        AND ${advancedTrades.profitLossAmount} != 'undefined'
                        THEN CAST(${advancedTrades.profitLossAmount} AS DECIMAL) 
                        ELSE NULL
                    END`
                    ),
                })
                .from(advancedTrades)
                .where(and(...tradeWhereConditions)),

            // Closed trades data for streaks and profit factor calculation
            db
                .select({
                    profitLossPercentage: advancedTrades.profitLossPercentage,
                    profitLossAmount: advancedTrades.profitLossAmount,
                    tradeDate: advancedTrades.tradeDate,
                    exitReason: advancedTrades.exitReason,
                    journalId: advancedTrades.journalId,
                })
                .from(advancedTrades)
                .where(
                    and(
                        ...tradeWhereConditions,
                        eq(advancedTrades.isClosed, true)
                    )
                )
                .orderBy(asc(advancedTrades.tradeDate)),

            // All trades for this journal (to find best trade)
            db.query.advancedTrades.findMany({
                with: {
                    tradesConfirmations: {
                        with: {
                            confirmations: true,
                        },
                    },
                },
                where: and(...tradeWhereConditions),
                orderBy: [
                    desc(advancedTrades.tradeDate),
                    desc(advancedTrades.createdAt),
                ],
            }),
        ]);

        // Extract stats from aggregated query
        const {
            totalTrades,
            closedTradesCount,
            winningTradesCount,
            losingTradesCount,
            tpTradesCount,
            beTradesCount,
            slTradesCount,
            avgPnL,
            rawTotalAmountPnL,
        } = extractAggregatedStats(aggregatedStats);

        // Get journal starting capital
        const journalData = {
            id: journal.id,
            startingCapital: journal.startingCapital,
            usePercentageCalculation: journal.usePercentageCalculation,
        };
        const startingCapital = getJournalStartingCapital(journalData);

        // Calculate derived stats
        const { totalPnLPercentage, totalAmountPnL } = calculateTotalPnL(
            closedTradesData,
            startingCapital,
            Number(rawTotalAmountPnL) || 0
        );

        const winRate =
            closedTradesCount > 0
                ? (winningTradesCount / closedTradesCount) * 100
                : 0;

        const streaks = calculateStreaks(closedTradesData);

        // Build journals map for profit factor calculation
        const journalsMap = buildJournalsMap([journalData]);
        const profitFactor = calculateProfitFactor({
            trades: closedTradesData,
            journalsMap,
            singleJournalId: journalId,
            singleJournalStartingCapital: startingCapital,
        });

        // Build stats object matching RouterOutput["trading"]["getStats"]
        const stats = {
            totalTrades,
            closedTrades: closedTradesCount,
            totalPnL: totalPnLPercentage,
            avgPnL: Number(avgPnL) || 0,
            totalAmountPnL: Number(totalAmountPnL) || undefined,
            winningTrades: winningTradesCount,
            losingTrades: losingTradesCount,
            winRate,
            profitFactor,
            tradesBySymbol: [],
            tradesByConfirmation: [],
            tpTrades: tpTradesCount,
            beTrades: beTradesCount,
            slTrades: slTradesCount,
            currentWinningStreak: streaks.currentWinningStreak,
            currentLosingStreak: streaks.currentLosingStreak,
            maxWinningStreak: streaks.maxWinningStreak,
            maxLosingStreak: streaks.maxLosingStreak,
            journal: journalData.usePercentageCalculation
                ? {
                      usePercentageCalculation:
                          journalData.usePercentageCalculation,
                      startingCapital: journalData.startingCapital || undefined,
                  }
                : undefined,
        };

        return {
            journal,
            stats,
            trades,
        };
    }
);
