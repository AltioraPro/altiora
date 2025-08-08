import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { 
  tradingJournals, 
  tradingAssets, 
  tradingSessions, 
  tradingSetups, 
  advancedTrades 
} from "@/server/db/schema";
import { 
  filterTradesSchema,
  tradingStatsSchema,
} from "../validators";
import { eq, and, desc, gte, lte, like, sql, count, sum, avg } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const tradingQueriesRouter = createTRPCRouter({
  // Queries pour les journaux de trading
  getTradingJournals: protectedProcedure
    .query(async ({ ctx }) => {
      const { session } = ctx;
      const userId = session.userId;

      const journals = await db
        .select()
        .from(tradingJournals)
        .where(and(
          eq(tradingJournals.userId, userId),
          eq(tradingJournals.isActive, true)
        ))
        .orderBy(desc(tradingJournals.isDefault), desc(tradingJournals.createdAt));

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
        .where(and(
          eq(tradingJournals.id, input.id),
          eq(tradingJournals.userId, userId)
        ))
        .limit(1);

      if (!journal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journal de trading non trouvé",
        });
      }

      return journal;
    }),

  getDefaultTradingJournal: protectedProcedure
    .query(async ({ ctx }) => {
      const { session } = ctx;
      const userId = session.userId;

      const [journal] = await db
        .select()
        .from(tradingJournals)
        .where(and(
          eq(tradingJournals.userId, userId),
          eq(tradingJournals.isDefault, true),
          eq(tradingJournals.isActive, true)
        ))
        .limit(1);

      return journal;
    }),

  // Queries pour les assets
  getTradingAssets: protectedProcedure
    .input(z.object({ journalId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const whereConditions = [eq(tradingAssets.userId, userId), eq(tradingAssets.isActive, true)];
      
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
        .where(and(
          eq(tradingAssets.id, input.id),
          eq(tradingAssets.userId, userId)
        ))
        .limit(1);

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset non trouvé",
        });
      }

      return asset;
    }),

  // Queries pour les sessions
  getTradingSessions: protectedProcedure
    .input(z.object({ journalId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const whereConditions = [eq(tradingSessions.userId, userId), eq(tradingSessions.isActive, true)];
      
      if (input.journalId) {
        whereConditions.push(eq(tradingSessions.journalId, input.journalId));
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
        .where(and(
          eq(tradingSessions.id, input.id),
          eq(tradingSessions.userId, userId)
        ))
        .limit(1);

      if (!tradingSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session non trouvée",
        });
      }

      return tradingSession;
    }),

  // Queries pour les setups
  getTradingSetups: protectedProcedure
    .input(z.object({ journalId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const whereConditions = [eq(tradingSetups.userId, userId), eq(tradingSetups.isActive, true)];
      
      if (input.journalId) {
        whereConditions.push(eq(tradingSetups.journalId, input.journalId));
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
        .where(and(
          eq(tradingSetups.id, input.id),
          eq(tradingSetups.userId, userId)
        ))
        .limit(1);

      if (!setup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Setup non trouvé",
        });
      }

      return setup;
    }),

  // Queries pour les trades avancés
  getAdvancedTrades: protectedProcedure
    .input(filterTradesSchema)
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const whereConditions = [eq(advancedTrades.userId, userId)];
      
      if (input.journalId) {
        whereConditions.push(eq(advancedTrades.journalId, input.journalId));
      }
      if (input.assetId) {
        whereConditions.push(eq(advancedTrades.assetId, input.assetId));
      }
      if (input.sessionId) {
        whereConditions.push(eq(advancedTrades.sessionId, input.sessionId));
      }
      if (input.setupId) {
        whereConditions.push(eq(advancedTrades.setupId, input.setupId));
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

      const trades = await db
        .select()
        .from(advancedTrades)
        .where(and(...whereConditions))
        .orderBy(desc(advancedTrades.tradeDate), desc(advancedTrades.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Plus de champ tags dans advancedTrades
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
        .where(and(
          eq(advancedTrades.id, input.id),
          eq(advancedTrades.userId, userId)
        ))
        .limit(1);

      if (!trade) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trade non trouvé",
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
      }
      if (input.startDate) {
        whereConditions.push(gte(advancedTrades.tradeDate, input.startDate));
      }
      if (input.endDate) {
        whereConditions.push(lte(advancedTrades.tradeDate, input.endDate));
      }

      // Statistiques de base
      const [totalTrades] = await db
        .select({ count: count() })
        .from(advancedTrades)
        .where(and(...whereConditions));

      const [closedTrades] = await db
        .select({ count: count() })
        .from(advancedTrades)
        .where(and(...whereConditions, eq(advancedTrades.isClosed, true)));

      // Calcul du P&L total
      const [pnlStats] = await db
        .select({
          totalPnL: sum(sql`CAST(${advancedTrades.profitLossPercentage} AS DECIMAL)`),
          avgPnL: avg(sql`CAST(${advancedTrades.profitLossPercentage} AS DECIMAL)`),
        })
        .from(advancedTrades)
        .where(and(...whereConditions, eq(advancedTrades.isClosed, true)));

      // Trades gagnants vs perdants
      const [winningTrades] = await db
        .select({ count: count() })
        .from(advancedTrades)
        .where(and(
          ...whereConditions,
          eq(advancedTrades.isClosed, true),
          sql`CAST(${advancedTrades.profitLossPercentage} AS DECIMAL) > 0`
        ));

      const [losingTrades] = await db
        .select({ count: count() })
        .from(advancedTrades)
        .where(and(
          ...whereConditions,
          eq(advancedTrades.isClosed, true),
          sql`CAST(${advancedTrades.profitLossPercentage} AS DECIMAL) < 0`
        ));

      // Trades par symbole
      const tradesBySymbol = await db
        .select({
          symbol: advancedTrades.symbol,
          count: count(),
          totalPnL: sum(sql`CAST(${advancedTrades.profitLossPercentage} AS DECIMAL)`),
        })
        .from(advancedTrades)
        .where(and(...whereConditions))
        .groupBy(advancedTrades.symbol)
        .orderBy(desc(count()));

      // Trades par setup
      const tradesBySetup = await db
        .select({
          setupId: advancedTrades.setupId,
          count: count(),
          totalPnL: sum(sql`CAST(${advancedTrades.profitLossPercentage} AS DECIMAL)`),
        })
        .from(advancedTrades)
        .where(and(...whereConditions))
        .groupBy(advancedTrades.setupId)
        .orderBy(desc(count()));

      // Statistiques de sortie (TP, BE, SL)
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

      return {
        totalTrades: totalTrades.count,
        closedTrades: closedTrades.count,
        totalPnL: pnlStats.totalPnL || 0,
        avgPnL: pnlStats.avgPnL || 0,
        winningTrades: winningTrades.count,
        losingTrades: losingTrades.count,
        winRate: closedTrades.count > 0 ? (winningTrades.count / closedTrades.count) * 100 : 0,
        tradesBySymbol,
        tradesBySetup,
        tpTrades: tpTrades.count,
        beTrades: beTrades.count,
        slTrades: slTrades.count,
      };
    }),

  // Query pour obtenir tous les éléments d'un journal
  getJournalOverview: protectedProcedure
    .input(z.object({ journalId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      // Vérifier que le journal appartient à l'utilisateur
      const [journal] = await db
        .select()
        .from(tradingJournals)
        .where(and(
          eq(tradingJournals.id, input.journalId),
          eq(tradingJournals.userId, userId)
        ))
        .limit(1);

      if (!journal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journal de trading non trouvé",
        });
      }

      // Récupérer tous les éléments du journal
      const [assets, sessions, setups, trades] = await Promise.all([
        db
          .select()
          .from(tradingAssets)
          .where(and(
            eq(tradingAssets.journalId, input.journalId),
            eq(tradingAssets.isActive, true)
          ))
          .orderBy(tradingAssets.name),

        db
          .select()
          .from(tradingSessions)
          .where(and(
            eq(tradingSessions.journalId, input.journalId),
            eq(tradingSessions.isActive, true)
          ))
          .orderBy(tradingSessions.name),

        db
          .select()
          .from(tradingSetups)
          .where(and(
            eq(tradingSetups.journalId, input.journalId),
            eq(tradingSetups.isActive, true)
          ))
          .orderBy(tradingSetups.name),

        db
          .select()
          .from(advancedTrades)
          .where(eq(advancedTrades.journalId, input.journalId))
          .orderBy(desc(advancedTrades.tradeDate))
          .limit(10), // Derniers 10 trades
      ]);

      return {
        journal,
        assets,
        sessions,
        setups,
        recentTrades: trades,
      };
    }),
}); 