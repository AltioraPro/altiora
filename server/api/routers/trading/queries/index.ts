import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db, cacheUtils } from "@/server/db";
import {
  tradingJournals,
  tradingAssets,
  tradingSessions,
  tradingSetups,
  advancedTrades,
} from "@/server/db/schema";
import { filterTradesSchema, tradingStatsSchema } from "../validators";
import {
  eq,
  and,
  desc,
  asc,
  gte,
  lte,
  like,
  sql,
  count,
  sum,
  avg,
  inArray,
} from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const tradingQueriesRouter = createTRPCRouter({
  getTradingJournals: protectedProcedure.query(async ({ ctx }) => {
    const { session } = ctx;
    const userId = session.userId;

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
  }),

  getTradingJournalById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const [journal] = await db
        .select()
        .from(tradingJournals)
        .where(
          and(
            eq(tradingJournals.id, input.id),
            eq(tradingJournals.userId, userId)
          )
        )
        .limit(1);

      if (!journal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trading journal not found",
        });
      }

      return journal;
    }),

  getTradingAssets: protectedProcedure
    .input(z.object({ journalId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const whereConditions = [
        eq(tradingAssets.userId, userId),
        eq(tradingAssets.isActive, true),
      ];

      if (input.journalId) {
        whereConditions.push(eq(tradingAssets.journalId, input.journalId));
      }

      const assets = await db
        .select()
        .from(tradingAssets)
        .where(and(...whereConditions))
        .orderBy(tradingAssets.name);

      return assets;
    }),

  getTradingAssetById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const [asset] = await db
        .select()
        .from(tradingAssets)
        .where(
          and(eq(tradingAssets.id, input.id), eq(tradingAssets.userId, userId))
        )
        .limit(1);

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }

      return asset;
    }),

  getTradingSessions: protectedProcedure
    .input(
      z.object({
        journalId: z.string().optional(),
        journalIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const whereConditions = [
        eq(tradingSessions.userId, userId),
        eq(tradingSessions.isActive, true),
      ];

      if (input.journalId) {
        whereConditions.push(eq(tradingSessions.journalId, input.journalId));
      } else if (input.journalIds && input.journalIds.length > 0) {
        whereConditions.push(
          inArray(tradingSessions.journalId, input.journalIds)
        );
      }

      const sessions = await db
        .select()
        .from(tradingSessions)
        .where(and(...whereConditions))
        .orderBy(tradingSessions.name);

      return sessions;
    }),

  getTradingSessionById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const [tradingSession] = await db
        .select()
        .from(tradingSessions)
        .where(
          and(
            eq(tradingSessions.id, input.id),
            eq(tradingSessions.userId, userId)
          )
        )
        .limit(1);

      if (!tradingSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      return tradingSession;
    }),

  getTradingSetups: protectedProcedure
    .input(
      z.object({
        journalId: z.string().optional(),
        journalIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

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
    }),

  getTradingSetupById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const [setup] = await db
        .select()
        .from(tradingSetups)
        .where(
          and(eq(tradingSetups.id, input.id), eq(tradingSetups.userId, userId))
        )
        .limit(1);

      if (!setup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Setup not found",
        });
      }

      return setup;
    }),

  getAdvancedTrades: protectedProcedure
    .input(filterTradesSchema)
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const whereConditions = [eq(advancedTrades.userId, userId)];

      if (input.journalId) {
        whereConditions.push(eq(advancedTrades.journalId, input.journalId));
      } else if (input.journalIds && input.journalIds.length > 0) {
        whereConditions.push(
          inArray(advancedTrades.journalId, input.journalIds)
        );
      }
      if (input.assetId) {
        whereConditions.push(eq(advancedTrades.assetId, input.assetId));
      } else if (input.assetIds && input.assetIds.length > 0) {
        whereConditions.push(inArray(advancedTrades.assetId, input.assetIds));
      }
      if (input.sessionId) {
        whereConditions.push(eq(advancedTrades.sessionId, input.sessionId));
      } else if (input.sessionIds && input.sessionIds.length > 0) {
        whereConditions.push(
          inArray(advancedTrades.sessionId, input.sessionIds)
        );
      }
      if (input.setupId) {
        whereConditions.push(eq(advancedTrades.setupId, input.setupId));
      } else if (input.setupIds && input.setupIds.length > 0) {
        whereConditions.push(inArray(advancedTrades.setupId, input.setupIds));
      }
      if (input.symbol) {
        whereConditions.push(like(advancedTrades.symbol, `%${input.symbol}%`));
      }
      if (input.startDate) {
        whereConditions.push(gte(advancedTrades.tradeDate, input.startDate));
      }
      if (input.endDate) {
        whereConditions.push(lte(advancedTrades.tradeDate, input.endDate));
      }
      if (input.isClosed !== undefined) {
        whereConditions.push(eq(advancedTrades.isClosed, input.isClosed));
      }

      const trades = input.limit
        ? await db
            .select()
            .from(advancedTrades)
            .where(and(...whereConditions))
            .orderBy(
              desc(advancedTrades.tradeDate),
              desc(advancedTrades.createdAt)
            )
            .limit(input.limit)
            .offset(input.offset || 0)
        : await db
            .select()
            .from(advancedTrades)
            .where(and(...whereConditions))
            .orderBy(
              desc(advancedTrades.tradeDate),
              desc(advancedTrades.createdAt)
            );

      return trades;
    }),

  getAdvancedTradeById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const [trade] = await db
        .select()
        .from(advancedTrades)
        .where(
          and(
            eq(advancedTrades.id, input.id),
            eq(advancedTrades.userId, userId)
          )
        )
        .limit(1);

      if (!trade) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trade not found",
        });
      }

      return trade;
    }),

  getTradingStats: protectedProcedure
    .input(tradingStatsSchema)
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const whereConditions = [eq(advancedTrades.userId, userId)];

      if (input.journalId) {
        whereConditions.push(eq(advancedTrades.journalId, input.journalId));
      } else if (input.journalIds && input.journalIds.length > 0) {
        whereConditions.push(
          inArray(advancedTrades.journalId, input.journalIds)
        );
      }
      if (input.assetIds && input.assetIds.length > 0) {
        whereConditions.push(inArray(advancedTrades.assetId, input.assetIds));
      }
      if (input.sessionIds && input.sessionIds.length > 0) {
        whereConditions.push(
          inArray(advancedTrades.sessionId, input.sessionIds)
        );
      }
      if (input.setupIds && input.setupIds.length > 0) {
        whereConditions.push(inArray(advancedTrades.setupId, input.setupIds));
      }
      if (input.startDate) {
        whereConditions.push(gte(advancedTrades.tradeDate, input.startDate));
      }
      if (input.endDate) {
        whereConditions.push(lte(advancedTrades.tradeDate, input.endDate));
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
            sql`CAST(${advancedTrades.profitLossPercentage} AS DECIMAL)`
          ),
          avgPnL: avg(
            sql`CAST(${advancedTrades.profitLossPercentage} AS DECIMAL)`
          ),
          totalAmountPnL: sum(
            sql`CAST(${advancedTrades.profitLossAmount} AS DECIMAL)`
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

      const [tpAggregation] = await db
        .select({
          total: sum(
            sql`CAST(${advancedTrades.profitLossPercentage} AS DECIMAL)`
          ),
          count: count(),
        })
        .from(advancedTrades)
        .where(
          and(
            ...whereConditions,
            eq(advancedTrades.isClosed, true),
            eq(advancedTrades.exitReason, "TP")
          )
        );

      const [slAggregation] = await db
        .select({
          total: sum(
            sql`CAST(${advancedTrades.profitLossPercentage} AS DECIMAL)`
          ),
          count: count(),
        })
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
          symbol: advancedTrades.symbol,
          count: count(),
          totalPnL: sum(
            sql`CAST(${advancedTrades.profitLossPercentage} AS DECIMAL)`
          ),
        })
        .from(advancedTrades)
        .where(and(...whereConditions))
        .groupBy(advancedTrades.symbol)
        .orderBy(desc(count()));

      const tradesBySetup = await db
        .select({
          setupId: advancedTrades.setupId,
          count: count(),
          totalPnL: sum(
            sql`CAST(${advancedTrades.profitLossPercentage} AS DECIMAL)`
          ),
        })
        .from(advancedTrades)
        .where(and(...whereConditions))
        .groupBy(advancedTrades.setupId)
        .orderBy(desc(count()));

      const [tpTrades] = await db
        .select({ count: count() })
        .from(advancedTrades)
        .where(and(...whereConditions, eq(advancedTrades.exitReason, "TP")));

      const [beTrades] = await db
        .select({ count: count() })
        .from(advancedTrades)
        .where(and(...whereConditions, eq(advancedTrades.exitReason, "BE")));

      const [slTrades] = await db
        .select({ count: count() })
        .from(advancedTrades)
        .where(and(...whereConditions, eq(advancedTrades.exitReason, "SL")));

      let totalAmountPnL = pnlStats.totalAmountPnL || 0;
      let totalPnLPercentage = 0;

      const closedTradesData = await db
        .select({
          profitLossPercentage: advancedTrades.profitLossPercentage,
          profitLossAmount: advancedTrades.profitLossAmount,
          tradeDate: advancedTrades.tradeDate,
        })
        .from(advancedTrades)
        .where(and(...whereConditions, eq(advancedTrades.isClosed, true)))
        .orderBy(asc(advancedTrades.tradeDate), asc(advancedTrades.createdAt));

      if (closedTradesData.length > 0) {
        totalPnLPercentage = closedTradesData.reduce((sum, trade) => {
          const pnlPercentage = trade.profitLossPercentage
            ? parseFloat(trade.profitLossPercentage) || 0
            : 0;
          return sum + pnlPercentage;
        }, 0);

        if (journal?.usePercentageCalculation && journal?.startingCapital) {
          const startingCapital = parseFloat(journal.startingCapital);
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

      // Calcul des streaks (séries consécutives)
      let currentWinningStreak = 0;
      let currentLosingStreak = 0;
      let maxWinningStreak = 0;
      let maxLosingStreak = 0;

      if (closedTradesData.length > 0) {
        // Trier par date puis par heure de création pour s'assurer de l'ordre chronologique
        const sortedTrades = closedTradesData.sort((a, b) => {
          const dateA = new Date(a.tradeDate).getTime();
          const dateB = new Date(b.tradeDate).getTime();
          if (dateA !== dateB) return dateA - dateB;
          return 0; // Si même date, garder l'ordre de création
        });

        for (const trade of sortedTrades) {
          const pnl = parseFloat(trade.profitLossPercentage || "0");

          if (pnl > 0) {
            // Trade gagnant
            currentWinningStreak++;
            currentLosingStreak = 0;
            maxWinningStreak = Math.max(maxWinningStreak, currentWinningStreak);
          } else if (pnl < 0) {
            // Trade perdant
            currentLosingStreak++;
            currentWinningStreak = 0;
            maxLosingStreak = Math.max(maxLosingStreak, currentLosingStreak);
          } else {
            // Trade BE - interrompt les streaks
            currentWinningStreak = 0;
            currentLosingStreak = 0;
          }
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
        avgGain:
          tpAggregation &&
          tpAggregation.count > 0 &&
          tpAggregation.total !== null
            ? Number(tpAggregation.total) / tpAggregation.count
            : 0,
        avgLoss:
          slAggregation &&
          slAggregation.count > 0 &&
          slAggregation.total !== null
            ? Math.abs(Number(slAggregation.total) / slAggregation.count)
            : 0,
        winRate: winRate,
        tradesBySymbol,
        tradesBySetup,
        tpTrades: tpTrades.count,
        beTrades: beTrades.count,
        slTrades: slTrades.count,
        currentWinningStreak,
        currentLosingStreak,
        maxWinningStreak,
        maxLosingStreak,
        journal: journal
          ? {
              usePercentageCalculation: journal.usePercentageCalculation,
              startingCapital: journal.startingCapital || undefined,
            }
          : undefined,
      };
    }),

  getCurrentCapital: protectedProcedure
    .input(z.object({ journalId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const cached = await cacheUtils.getStats(userId, "trading-capital", {
        journalId: input.journalId,
      });
      if (cached) {
        return cached;
      }

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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trading journal not found",
        });
      }

      if (!journal.usePercentageCalculation || !journal.startingCapital) {
        return { currentCapital: null, startingCapital: null };
      }

      const startingCapital = parseFloat(journal.startingCapital);

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
        const pnlPercentage = trade.profitLossPercentage
          ? parseFloat(trade.profitLossPercentage) || 0
          : 0;
        return sum + pnlPercentage;
      }, 0);

      const currentCapital =
        startingCapital + (totalPnLPercentage / 100) * startingCapital;

      const result = {
        currentCapital: currentCapital.toFixed(2),
        startingCapital: startingCapital.toFixed(2),
      };

      await cacheUtils.setStats(
        userId,
        "trading-capital",
        result,
        { journalId: input.journalId },
        600
      );

      return result;
    }),

  getJournalOverview: protectedProcedure
    .input(z.object({ journalId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

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
        throw new TRPCError({
          code: "NOT_FOUND",
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
          .from(tradingSetups)
          .where(
            and(
              eq(tradingSetups.journalId, input.journalId),
              eq(tradingSetups.isActive, true)
            )
          )
          .orderBy(tradingSetups.name),

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
    }),

  getTradeById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const [trade] = await db
        .select()
        .from(advancedTrades)
        .where(
          and(
            eq(advancedTrades.id, input.id),
            eq(advancedTrades.userId, userId)
          )
        )
        .limit(1);

      if (!trade) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trade not found",
        });
      }

      return trade;
    }),
});
