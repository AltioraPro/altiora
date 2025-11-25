import { and, asc, avg, count, desc, eq, sql, sum } from "drizzle-orm";
import {
    advancedTrades,
    tradesConfirmations,
    tradingJournals,
} from "@/server/db/schema/index";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import {
    buildJournalWhereConditions,
    buildTradeWhereConditions,
} from "../utils/build-conditions";
import { buildJournalsMap } from "../utils/build-journals-map";
import { calculateProfitFactor } from "../utils/calculate-profit-factor";
import { calculateStreaks } from "../utils/calculate-streaks";
import { calculateTotalPnL } from "../utils/calculate-total-pnl";
import { extractAggregatedStats } from "../utils/extract-aggregate-strats";
import { getJournalStartingCapital } from "../utils/get-journal-starting-capital";
import { tradingStatsSchema } from "../validators";

export const getTradingStatsBase = protectedProcedure.input(tradingStatsSchema);

export const getTradingStatsHandler = getTradingStatsBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const whereConditions = buildTradeWhereConditions(userId, input);
        const whereJournalConditions = buildJournalWhereConditions(
            userId,
            input
        );

        // Run all independent queries in parallel
        const [
            aggregatedStats,
            closedTradesData,
            tradesBySymbol,
            tradesByConfirmation,
            journalsList,
        ] = await Promise.all([
            // Combined aggregated stats query - replaces 7 separate count queries + pnlStats
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
                .where(and(...whereConditions)),

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
                    and(...whereConditions, eq(advancedTrades.isClosed, true))
                )
                .orderBy(asc(advancedTrades.tradeDate)),

            // Trades by symbol
            db
                .select({
                    assetId: advancedTrades.assetId,
                    count: count(),
                    totalPnL: sum(
                        sql`CAST(NULLIF(${advancedTrades.profitLossPercentage}, 'undefined') AS DECIMAL)`
                    ),
                })
                .from(advancedTrades)
                .where(and(...whereConditions))
                .groupBy(advancedTrades.assetId)
                .orderBy(desc(count())),

            // Trades by confirmation
            db
                .select({
                    count: count(),
                    totalPnL: sum(
                        sql`CAST(NULLIF(${advancedTrades.profitLossPercentage}, 'undefined') AS DECIMAL)`
                    ),
                })
                .from(advancedTrades)
                .innerJoin(
                    tradesConfirmations,
                    eq(advancedTrades.id, tradesConfirmations.advancedTradeId)
                )
                .where(and(...whereConditions))
                .groupBy(tradesConfirmations.confirmationId)
                .orderBy(desc(count())),

            // Fetch journals (handles both single journal and multi-journal/global cases)
            db
                .select({
                    id: tradingJournals.id,
                    startingCapital: tradingJournals.startingCapital,
                    usePercentageCalculation:
                        tradingJournals.usePercentageCalculation,
                })
                .from(tradingJournals)
                .where(and(...whereJournalConditions)),
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

        // Build journals map and get single journal
        const journalsMap = buildJournalsMap(journalsList);
        const journal = input.journalId
            ? (journalsList.find((j) => j.id === input.journalId) ?? null)
            : null;
        const startingCapital = getJournalStartingCapital(journal);

        // Calculate derived stats using helper functions
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
        const profitFactor = calculateProfitFactor({
            trades: closedTradesData,
            journalsMap,
            singleJournalId: input.journalId ?? null,
            singleJournalStartingCapital: startingCapital,
        });

        return {
            totalTrades,
            closedTrades: closedTradesCount,
            totalPnL: totalPnLPercentage,
            avgPnL,
            totalAmountPnL: Number(totalAmountPnL) || undefined,
            winningTrades: winningTradesCount,
            losingTrades: losingTradesCount,
            winRate,
            profitFactor,
            tradesBySymbol,
            tradesByConfirmation,
            tpTrades: tpTradesCount,
            beTrades: beTradesCount,
            slTrades: slTradesCount,
            currentWinningStreak: streaks.currentWinningStreak,
            currentLosingStreak: streaks.currentLosingStreak,
            maxWinningStreak: streaks.maxWinningStreak,
            maxLosingStreak: streaks.maxLosingStreak,
            journal: journal
                ? {
                      usePercentageCalculation:
                          journal.usePercentageCalculation,
                      startingCapital: journal.startingCapital || undefined,
                  }
                : undefined,
        };
    }
);
