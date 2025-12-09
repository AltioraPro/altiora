import { and, asc, avg, count, desc, eq, sql, sum } from "drizzle-orm";
import { advancedTrades, tradingJournals } from "@/server/db/schema/index";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { buildJournalsMap } from "../utils/build-journals-map";
import { calculateProfitFactor } from "../utils/calculate-profit-factor";
import { calculateStreaks } from "../utils/calculate-streaks";
import { calculateTotalPnL } from "../utils/calculate-total-pnl";
import { extractAggregatedStats } from "../utils/extract-aggregate-strats";
import { getJournalStartingCapital } from "../utils/get-journal-starting-capital";
import { getJournalsTableDataSchema } from "../validators";

export const getJournalsTableDataBase = protectedProcedure.input(
    getJournalsTableDataSchema
);

export const getJournalsTableDataHandler = getJournalsTableDataBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const page = input?.page ?? 0;
        const pageSize = input?.pageSize ?? 8;
        const offset = page * pageSize;

        // Fetch total count of active journals
        const total = await db
            .select({ count: sql<number>`count(*)` })
            .from(tradingJournals)
            .where(
                and(
                    eq(tradingJournals.userId, userId),
                    eq(tradingJournals.isActive, true)
                )
            );

        const totalCount = total[0]?.count || 0;

        // Fetch paginated active journals for the user
        const journals = await db
            .select()
            .from(tradingJournals)
            .where(
                and(
                    eq(tradingJournals.userId, userId),
                    eq(tradingJournals.isActive, true)
                )
            )
            .orderBy(tradingJournals.order, desc(tradingJournals.createdAt))
            .limit(pageSize)
            .offset(offset);

        // Process each journal in parallel to get stats and trades
        const journalDataPromises = journals.map(async (journal) => {
            const journalId = journal.id;

            // Build where conditions for this journal
            const tradeWhereConditions = [
                eq(advancedTrades.userId, userId),
                eq(advancedTrades.journalId, journalId),
            ];

            // Fetch stats and trades in parallel for this journal
            const [aggregatedStats, closedTradesData, trades] =
                await Promise.all([
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
                            profitLossPercentage:
                                advancedTrades.profitLossPercentage,
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

                    // All trades for this journal
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
                          startingCapital:
                              journalData.startingCapital || undefined,
                      }
                    : undefined,
            };

            return {
                journal,
                stats,
                trades,
            };
        });

        // Wait for all journal data to be processed
        const journalData = await Promise.all(journalDataPromises);

        return {
            data: journalData,
            totalCount: Number(totalCount),
            page,
            pageSize,
        };
    }
);
