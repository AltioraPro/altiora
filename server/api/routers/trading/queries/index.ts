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
import { eq, and, desc, gte, lte, like, sql, count, sum, avg, inArray } from "drizzle-orm";
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
        .where(and(
          eq(tradingJournals.id, input.id),
          eq(tradingJournals.userId, userId)
        ))
        .limit(1);

      if (!journal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trading journal not found",
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
          message: "Asset not found",
        });
      }

      return asset;
    }),

  // Queries pour les sessions
  getTradingSessions: protectedProcedure
    .input(z.object({ 
      journalId: z.string().optional(),
      journalIds: z.array(z.string()).optional()
    }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const whereConditions = [eq(tradingSessions.userId, userId), eq(tradingSessions.isActive, true)];
      
      if (input.journalId) {
        whereConditions.push(eq(tradingSessions.journalId, input.journalId));
      } else if (input.journalIds && input.journalIds.length > 0) {
        whereConditions.push(inArray(tradingSessions.journalId, input.journalIds));
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
          message: "Session not found",
        });
      }

      return tradingSession;
    }),

  // Queries pour les setups
  getTradingSetups: protectedProcedure
    .input(z.object({ 
      journalId: z.string().optional(),
      journalIds: z.array(z.string()).optional()
    }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      const whereConditions = [eq(tradingSetups.userId, userId), eq(tradingSetups.isActive, true)];
      
      if (input.journalId) {
        whereConditions.push(eq(tradingSetups.journalId, input.journalId));
      } else if (input.journalIds && input.journalIds.length > 0) {
        whereConditions.push(inArray(tradingSetups.journalId, input.journalIds));
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
          message: "Setup not found",
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
      } else if (input.journalIds && input.journalIds.length > 0) {
        whereConditions.push(inArray(advancedTrades.journalId, input.journalIds));
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
        whereConditions.push(inArray(advancedTrades.journalId, input.journalIds));
      }
      if (input.startDate) {
        whereConditions.push(gte(advancedTrades.tradeDate, input.startDate));
      }
      if (input.endDate) {
        whereConditions.push(lte(advancedTrades.tradeDate, input.endDate));
      }

      // Récupérer les infos du journal si journalId est fourni
      let journal = null;
      if (input.journalId) {
        const [journalResult] = await db
          .select()
          .from(tradingJournals)
          .where(and(
            eq(tradingJournals.id, input.journalId),
            eq(tradingJournals.userId, userId)
          ))
          .limit(1);
        journal = journalResult;
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
          totalAmountPnL: sum(sql`CAST(${advancedTrades.profitLossAmount} AS DECIMAL)`),
        })
        .from(advancedTrades)
        .where(and(...whereConditions, eq(advancedTrades.isClosed, true)));

      // Trades gagnants vs perdants basés sur exitReason
      const [winningTrades] = await db
        .select({ count: count() })
        .from(advancedTrades)
        .where(and(
          ...whereConditions,
          eq(advancedTrades.isClosed, true),
          eq(advancedTrades.exitReason, "TP")
        ));

      const [losingTrades] = await db
        .select({ count: count() })
        .from(advancedTrades)
        .where(and(
          ...whereConditions,
          eq(advancedTrades.isClosed, true),
          eq(advancedTrades.exitReason, "SL")
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

      // Calculer le gain total en euros et le pourcentage total correct
      let totalAmountPnL = pnlStats.totalAmountPnL || 0;
      let totalPnLPercentage = pnlStats.totalPnL || 0;
      
      // Si on n'a pas de montant direct mais qu'on a le pourcentage et le capital de départ
      if ((!totalAmountPnL || totalAmountPnL === 0) && journal?.usePercentageCalculation && journal?.startingCapital) {
        const startingCapital = parseFloat(journal.startingCapital);
        
        // Calculer le capital actuel en additionnant tous les gains/pertes
        const currentCapital = startingCapital + (Number(totalPnLPercentage) / 100) * startingCapital;
        
        // Le gain total en euros est la différence entre le capital actuel et le capital de départ
        totalAmountPnL = currentCapital - startingCapital;
        
        // Le pourcentage total doit être calculé par rapport au capital de départ
        totalPnLPercentage = (totalAmountPnL / startingCapital) * 100;
        
        console.log("Calcul euros:", {
          startingCapital,
          currentCapital,
          totalPnLPercentage,
          calculatedAmount: totalAmountPnL,
          journal: journal
        });
      } else if (totalAmountPnL && journal?.usePercentageCalculation && journal?.startingCapital) {
        // Si on a déjà le montant total, calculer le pourcentage par rapport au capital de départ
        const startingCapital = parseFloat(journal.startingCapital);
        totalPnLPercentage = (Number(totalAmountPnL) / startingCapital) * 100;
        
        console.log("Calcul pourcentage depuis montant:", {
          startingCapital,
          totalAmountPnL,
          calculatedPercentage: totalPnLPercentage
        });
      }

      // Calculer le winrate : total des TP / nombre total de trades fermés * 100
      const winRate = closedTrades.count > 0 ? (winningTrades.count / closedTrades.count) * 100 : 0;

      return {
        totalTrades: totalTrades.count,
        closedTrades: closedTrades.count,
        totalPnL: totalPnLPercentage,
        avgPnL: pnlStats.avgPnL || 0,
        totalAmountPnL: Number(totalAmountPnL) || undefined,
        winningTrades: winningTrades.count,
        losingTrades: losingTrades.count,
        winRate: winRate,
        tradesBySymbol,
        tradesBySetup,
        tpTrades: tpTrades.count,
        beTrades: beTrades.count,
        slTrades: slTrades.count,
        journal: journal ? {
          usePercentageCalculation: journal.usePercentageCalculation,
          startingCapital: journal.startingCapital || undefined
        } : undefined, // Inclure les infos du journal pour l'affichage
      };
    }),

  // Query pour obtenir le capital actuel d'un journal
  getCurrentCapital: protectedProcedure
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
          message: "Trading journal not found",
        });
      }

      if (!journal.usePercentageCalculation || !journal.startingCapital) {
        return { currentCapital: null, startingCapital: null };
      }

      const startingCapital = parseFloat(journal.startingCapital);
      
      // Récupérer la somme de tous les trades fermés pour ce journal
      const [totalPnLResult] = await db
        .select({
          totalAmountPnL: sum(sql`CAST(${advancedTrades.profitLossAmount} AS DECIMAL)`),
        })
        .from(advancedTrades)
        .where(and(
          eq(advancedTrades.journalId, input.journalId),
          eq(advancedTrades.userId, userId),
          eq(advancedTrades.isClosed, true)
        ));
      
      const totalPnLAmount = totalPnLResult?.totalAmountPnL || 0;
      const currentCapital = startingCapital + Number(totalPnLAmount);

      return { 
        currentCapital: currentCapital.toFixed(2), 
        startingCapital: startingCapital.toFixed(2) 
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
          message: "Trading journal not found",
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