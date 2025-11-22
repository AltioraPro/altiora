import {
    and,
    asc,
    avg,
    count,
    desc,
    eq,
    gte,
    inArray,
    lte,
    sql,
    sum,
} from "drizzle-orm";
import { advancedTrades, tradingJournals } from "@/server/db/schema/index";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { tradingStatsSchema } from "../validators";

export const getTradingStatsBase = protectedProcedure.input(tradingStatsSchema);

export const getTradingStatsHandler = getTradingStatsBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const whereConditions = [eq(advancedTrades.userId, userId)];

        if (input.journalId) {
            whereConditions.push(eq(advancedTrades.journalId, input.journalId));
        } else if (input.journalIds && input.journalIds.length > 0) {
            whereConditions.push(
                inArray(advancedTrades.journalId, input.journalIds)
            );
        }
        if (input.assetIds && input.assetIds.length > 0) {
            whereConditions.push(
                inArray(advancedTrades.assetId, input.assetIds)
            );
        }
        if (input.sessionIds && input.sessionIds.length > 0) {
            whereConditions.push(
                inArray(advancedTrades.sessionId, input.sessionIds)
            );
        }
        if (input.confirmationIds && input.confirmationIds.length > 0) {
            whereConditions.push(
                inArray(advancedTrades.confirmationId, input.confirmationIds)
            );
        }
        if (input.startDate) {
            whereConditions.push(
                gte(advancedTrades.tradeDate, new Date(input.startDate))
            );
        }
        if (input.endDate) {
            whereConditions.push(
                lte(advancedTrades.tradeDate, new Date(input.endDate))
            );
        }

        let journal = null;
        if (input.journalId) {
            const [journalResult] = await db
                .select()
                .from(tradingJournals)
                .where(
                    and(
                        eq(tradingJournals.id, input.journalId),
                        eq(tradingJournals.userId, userId)
                    )
                )
                .limit(1);
            journal = journalResult;
        }

        const [totalTrades] = await db
            .select({ count: count() })
            .from(advancedTrades)
            .where(and(...whereConditions));

        const [closedTrades] = await db
            .select({ count: count() })
            .from(advancedTrades)
            .where(and(...whereConditions, eq(advancedTrades.isClosed, true)));

        const [pnlStats] = await db
            .select({
                totalPnL: sum(
                    sql`CAST(NULLIF(${advancedTrades.profitLossPercentage}, 'undefined') AS DECIMAL)`
                ),
                avgPnL: avg(
                    sql`CAST(NULLIF(${advancedTrades.profitLossPercentage}, 'undefined') AS DECIMAL)`
                ),
                totalAmountPnL: sum(
                    sql`CAST(NULLIF(${advancedTrades.profitLossAmount}, 'undefined') AS DECIMAL)`
                ),
            })
            .from(advancedTrades)
            .where(and(...whereConditions, eq(advancedTrades.isClosed, true)));

        const [winningTrades] = await db
            .select({ count: count() })
            .from(advancedTrades)
            .where(
                and(
                    ...whereConditions,
                    eq(advancedTrades.isClosed, true),
                    eq(advancedTrades.exitReason, "TP")
                )
            );

        const [losingTrades] = await db
            .select({ count: count() })
            .from(advancedTrades)
            .where(
                and(
                    ...whereConditions,
                    eq(advancedTrades.isClosed, true),
                    eq(advancedTrades.exitReason, "SL")
                )
            );

        const tradesBySymbol = await db
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
            .orderBy(desc(count()));

        const tradesByConfirmation = await db
            .select({
                confirmationId: advancedTrades.confirmationId,
                count: count(),
                totalPnL: sum(
                    sql`CAST(NULLIF(${advancedTrades.profitLossPercentage}, 'undefined') AS DECIMAL)`
                ),
            })
            .from(advancedTrades)
            .where(and(...whereConditions))
            .groupBy(advancedTrades.confirmationId)
            .orderBy(desc(count()));

        const [tpTrades] = await db
            .select({ count: count() })
            .from(advancedTrades)
            .where(
                and(...whereConditions, eq(advancedTrades.exitReason, "TP"))
            );

        const [beTrades] = await db
            .select({ count: count() })
            .from(advancedTrades)
            .where(
                and(...whereConditions, eq(advancedTrades.exitReason, "BE"))
            );

        const [slTrades] = await db
            .select({ count: count() })
            .from(advancedTrades)
            .where(
                and(...whereConditions, eq(advancedTrades.exitReason, "SL"))
            );

        let totalAmountPnL = pnlStats.totalAmountPnL || 0;
        let totalPnLPercentage = 0;

        const closedTradesData = await db
            .select({
                profitLossPercentage: advancedTrades.profitLossPercentage,
                profitLossAmount: advancedTrades.profitLossAmount,
                tradeDate: advancedTrades.tradeDate,
                exitReason: advancedTrades.exitReason,
            })
            .from(advancedTrades)
            .where(and(...whereConditions, eq(advancedTrades.isClosed, true)))
            .orderBy(asc(advancedTrades.tradeDate));

        if (closedTradesData.length > 0) {
            totalPnLPercentage = closedTradesData.reduce((sum, trade) => {
                const pnlPercentage = trade.profitLossPercentage
                    ? Number.parseFloat(trade.profitLossPercentage) || 0
                    : 0;
                return sum + pnlPercentage;
            }, 0);

            if (journal?.usePercentageCalculation && journal?.startingCapital) {
                const startingCapital = Number.parseFloat(
                    journal.startingCapital
                );
                totalAmountPnL = (totalPnLPercentage / 100) * startingCapital;
            } else {
                totalAmountPnL = pnlStats.totalAmountPnL || 0;
            }
        } else {
            totalPnLPercentage = 0;
            totalAmountPnL = 0;
        }

        const winRate =
            closedTrades.count > 0
                ? (winningTrades.count / closedTrades.count) * 100
                : 0;

        // Calculate streaks
        let currentWinningStreak = 0;
        let currentLosingStreak = 0;
        let maxWinningStreak = 0;
        let maxLosingStreak = 0;
        let tempWinningStreak = 0;
        let tempLosingStreak = 0;

        const sortedClosedTrades = closedTradesData.slice().sort((a, b) => {
            const dateA = new Date(a.tradeDate || 0).getTime();
            const dateB = new Date(b.tradeDate || 0).getTime();
            return dateA - dateB;
        });

        // Calculate current streaks from most recent trades
        for (let i = sortedClosedTrades.length - 1; i >= 0; i--) {
            const trade = sortedClosedTrades[i];
            const exitReason = trade?.exitReason;

            if (exitReason === "TP") {
                if (currentLosingStreak > 0) {
                    break;
                }
                currentWinningStreak++;
            } else if (exitReason === "SL") {
                if (currentWinningStreak > 0) {
                    break;
                }
                currentLosingStreak++;
            } else {
                // BE or Manual breaks the streak
                break;
            }
        }

        // Calculate max streaks
        for (const trade of sortedClosedTrades) {
            const exitReason = trade.exitReason;

            if (exitReason === "TP") {
                tempWinningStreak++;
                tempLosingStreak = 0;
                maxWinningStreak = Math.max(
                    maxWinningStreak,
                    tempWinningStreak
                );
            } else if (exitReason === "SL") {
                tempLosingStreak++;
                tempWinningStreak = 0;
                maxLosingStreak = Math.max(maxLosingStreak, tempLosingStreak);
            } else {
                // BE or Manual resets both streaks
                tempWinningStreak = 0;
                tempLosingStreak = 0;
            }
        }

        return {
            totalTrades: totalTrades.count,
            closedTrades: closedTrades.count,
            totalPnL: totalPnLPercentage,
            avgPnL: pnlStats.avgPnL || 0,
            totalAmountPnL: Number(totalAmountPnL) || undefined,
            winningTrades: winningTrades.count,
            losingTrades: losingTrades.count,
            winRate,
            tradesBySymbol,
            tradesByConfirmation,
            tpTrades: tpTrades.count,
            beTrades: beTrades.count,
            slTrades: slTrades.count,
            currentWinningStreak,
            currentLosingStreak,
            maxWinningStreak,
            maxLosingStreak,
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
