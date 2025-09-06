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
  createTradingJournalSchema,
  updateTradingJournalSchema,
  createTradingAssetSchema,
  updateTradingAssetSchema,
  createTradingSessionSchema,
  updateTradingSessionSchema,
  createTradingSetupSchema,
  updateTradingSetupSchema,
  createAdvancedTradeSchema,
  updateAdvancedTradeSchema,
  reorderJournalsSchema,
} from "../validators";
import { calculateTradeResults } from "@/server/services/trade-calculation";
import { eq, and, sum, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const tradingMutationsRouter = createTRPCRouter({
  // Mutations pour les journaux de trading
  createTradingJournal: protectedProcedure
    .input(createTradingJournalSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;
      
      // Si c'est le journal par défaut, désactiver les autres
      if (input.isDefault) {
        await db
          .update(tradingJournals)
          .set({ isDefault: false })
          .where(and(
            eq(tradingJournals.userId, userId),
            eq(tradingJournals.isDefault, true)
          ));
      }

      const [journal] = await db
        .insert(tradingJournals)
        .values({
          id: crypto.randomUUID(),
          userId,
          name: input.name,
          description: input.description,
          isDefault: input.isDefault,
          startingCapital: input.startingCapital,
          usePercentageCalculation: input.usePercentageCalculation ?? false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return journal;
    }),

  updateTradingJournal: protectedProcedure
    .input(updateTradingJournalSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;
      const { id, ...updateData } = input;

      // Vérifier que le journal appartient à l'utilisateur
      const existingJournal = await db
        .select()
        .from(tradingJournals)
        .where(and(
          eq(tradingJournals.id, id),
          eq(tradingJournals.userId, userId)
        ))
        .limit(1);

      if (!existingJournal.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journal de trading non trouvé",
        });
      }

      // Si c'est le journal par défaut, désactiver les autres
      if (updateData.isDefault) {
        await db
          .update(tradingJournals)
          .set({ isDefault: false })
          .where(and(
            eq(tradingJournals.userId, userId),
            eq(tradingJournals.isDefault, true),
            eq(tradingJournals.id, id)
          ));
      }

      const [journal] = await db
        .update(tradingJournals)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(
          eq(tradingJournals.id, id),
          eq(tradingJournals.userId, userId)
        ))
        .returning();

      return journal;
    }),

  deleteTradingJournal: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      // Vérifier que le journal appartient à l'utilisateur
      const existingJournal = await db
        .select()
        .from(tradingJournals)
        .where(and(
          eq(tradingJournals.id, input.id),
          eq(tradingJournals.userId, userId)
        ))
        .limit(1);

      if (!existingJournal.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journal de trading non trouvé",
        });
      }

      // Supprimer le journal (les assets, sessions, setups et trades seront supprimés en cascade)
      await db
        .delete(tradingJournals)
        .where(and(
          eq(tradingJournals.id, input.id),
          eq(tradingJournals.userId, userId)
        ));

      return { success: true };
    }),

  setDefaultTradingJournal: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      // Vérifier que le journal appartient à l'utilisateur
      const existingJournal = await db
        .select()
        .from(tradingJournals)
        .where(and(
          eq(tradingJournals.id, input.id),
          eq(tradingJournals.userId, userId)
        ))
        .limit(1);

      if (!existingJournal.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journal de trading non trouvé",
        });
      }

      // Désactiver tous les autres journaux par défaut
      await db
        .update(tradingJournals)
        .set({ isDefault: false })
        .where(and(
          eq(tradingJournals.userId, userId),
          eq(tradingJournals.isDefault, true)
        ));

      // Définir le journal sélectionné comme par défaut
      const [journal] = await db
        .update(tradingJournals)
        .set({ 
          isDefault: true,
          updatedAt: new Date(),
        })
        .where(and(
          eq(tradingJournals.id, input.id),
          eq(tradingJournals.userId, userId)
        ))
        .returning();

      return journal;
    }),

  // Mutations pour les assets
  createTradingAsset: protectedProcedure
    .input(createTradingAssetSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      // Vérifier que le journal appartient à l'utilisateur
      const journal = await db
        .select()
        .from(tradingJournals)
        .where(and(
          eq(tradingJournals.id, input.journalId),
          eq(tradingJournals.userId, userId)
        ))
        .limit(1);

      if (!journal.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journal de trading non trouvé",
        });
      }

      const [asset] = await db
        .insert(tradingAssets)
        .values({
          id: crypto.randomUUID(),
          userId,
          journalId: input.journalId,
          name: input.name,
          symbol: input.symbol || input.name,
          type: input.type,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return asset;
    }),

  updateTradingAsset: protectedProcedure
    .input(updateTradingAssetSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;
      const { id, ...updateData } = input;

      const [asset] = await db
        .update(tradingAssets)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(
          eq(tradingAssets.id, id),
          eq(tradingAssets.userId, userId)
        ))
        .returning();

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset non trouvé",
        });
      }

      return asset;
    }),

  deleteTradingAsset: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      await db
        .delete(tradingAssets)
        .where(and(
          eq(tradingAssets.id, input.id),
          eq(tradingAssets.userId, userId)
        ));

      return { success: true };
    }),

  // Mutations pour les sessions
  createTradingSession: protectedProcedure
    .input(createTradingSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      // Vérifier que le journal appartient à l'utilisateur
      const journal = await db
        .select()
        .from(tradingJournals)
        .where(and(
          eq(tradingJournals.id, input.journalId),
          eq(tradingJournals.userId, userId)
        ))
        .limit(1);

      if (!journal.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journal de trading non trouvé",
        });
      }

      const [tradingSession] = await db
        .insert(tradingSessions)
        .values({
          id: crypto.randomUUID(),
          userId,
          journalId: input.journalId,
          name: input.name,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          timezone: input.timezone,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return tradingSession;
    }),

  updateTradingSession: protectedProcedure
    .input(updateTradingSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;
      const { id, ...updateData } = input;

      const [tradingSession] = await db
        .update(tradingSessions)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(
          eq(tradingSessions.id, id),
          eq(tradingSessions.userId, userId)
        ))
        .returning();

      if (!tradingSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session non trouvée",
        });
      }

      return tradingSession;
    }),

  deleteTradingSession: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      await db
        .delete(tradingSessions)
        .where(and(
          eq(tradingSessions.id, input.id),
          eq(tradingSessions.userId, userId)
        ));

      return { success: true };
    }),

  // Mutations pour les setups
  createTradingSetup: protectedProcedure
    .input(createTradingSetupSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      // Vérifier que le journal appartient à l'utilisateur
      const journal = await db
        .select()
        .from(tradingJournals)
        .where(and(
          eq(tradingJournals.id, input.journalId),
          eq(tradingJournals.userId, userId)
        ))
        .limit(1);

      if (!journal.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journal de trading non trouvé",
        });
      }

      const [setup] = await db
        .insert(tradingSetups)
        .values({
          id: crypto.randomUUID(),
          userId,
          journalId: input.journalId,
          name: input.name,
          description: input.description,
          strategy: input.strategy,
          successRate: input.successRate,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return setup;
    }),

  updateTradingSetup: protectedProcedure
    .input(updateTradingSetupSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;
      const { id, ...updateData } = input;

      const [setup] = await db
        .update(tradingSetups)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(
          eq(tradingSetups.id, id),
          eq(tradingSetups.userId, userId)
        ))
        .returning();

      if (!setup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Setup non trouvé",
        });
      }

      return setup;
    }),

  deleteTradingSetup: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      await db
        .delete(tradingSetups)
        .where(and(
          eq(tradingSetups.id, input.id),
          eq(tradingSetups.userId, userId)
        ));

      return { success: true };
    }),

  // Mutations pour les trades avancés
  createAdvancedTrade: protectedProcedure
    .input(createAdvancedTradeSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;
      
      console.log("=== DÉBUT MUTATION SERVEUR ===");
      console.log("Création de trade avec les données:", input);
      console.log("UserId:", userId);
      console.log("Session:", session);

      // Vérifier que le journal appartient à l'utilisateur
      console.log("Recherche du journal avec ID:", input.journalId);
      const journal = await db
        .select()
        .from(tradingJournals)
        .where(and(
          eq(tradingJournals.id, input.journalId),
          eq(tradingJournals.userId, userId)
        ))
        .limit(1);

      console.log("Journal trouvé:", journal);

      if (!journal.length) {
        console.error("Journal non trouvé pour l'utilisateur");
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journal de trading non trouvé",
        });
      }

      // Récupérer l'assetId à partir du symbol si assetId n'est pas fourni
      let assetId = input.assetId;
      if (!assetId && input.symbol) {
        console.log("Recherche de l'asset avec le symbol:", input.symbol);
        const asset = await db
          .select()
          .from(tradingAssets)
          .where(and(
            eq(tradingAssets.symbol, input.symbol),
            eq(tradingAssets.journalId, input.journalId),
            eq(tradingAssets.userId, userId)
          ))
          .limit(1);
        
        console.log("Asset trouvé:", asset);
        assetId = asset[0]?.id;
      }

      console.log("Insertion du trade dans la base de données...");
      
      // Nettoyer les valeurs numériques
      const cleanRiskInput = input.riskInput ? String(input.riskInput).replace(/[%,]/g, '').trim() : null;
      
      // Calculer le capital actuel si le journal utilise le calcul en pourcentage
      let currentCapital: number | undefined;
      if (journal[0].usePercentageCalculation && journal[0].startingCapital) {
        const startingCapital = parseFloat(journal[0].startingCapital);
        
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
        currentCapital = startingCapital + Number(totalPnLAmount);
        
        console.log("Capital actuel calculé:", {
          startingCapital,
          totalPnLAmount,
          currentCapital
        });
      }
      
      // Calculer les résultats du trade (montant <-> pourcentage)
      const calculatedResults = calculateTradeResults(
        {
          profitLossAmount: input.profitLossAmount,
          profitLossPercentage: input.profitLossPercentage,
          exitReason: input.exitReason,
        },
        journal[0],
        currentCapital
      );
      
      console.log("Résultats calculés:", calculatedResults);
      
      const tradeValues = {
        id: crypto.randomUUID(),
        userId,
        journalId: input.journalId,
        assetId: assetId || null,
        sessionId: input.sessionId || null,
        setupId: input.setupId || null,
        tradeDate: input.tradeDate,
        symbol: input.symbol || '',
        riskInput: cleanRiskInput,
        profitLossAmount: calculatedResults.profitLossAmount || null,
        profitLossPercentage: calculatedResults.profitLossPercentage,
        exitReason: calculatedResults.exitReason,
        breakEvenThreshold: "0.1", // Valeur par défaut, non utilisée
        tradingviewLink: input.tradingviewLink || null,
        notes: input.notes || null,
        isClosed: input.isClosed ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log("Valeurs du trade à insérer:", tradeValues);
      
      const [trade] = await db
        .insert(advancedTrades)
        .values(tradeValues)
        .returning();

      console.log("Trade créé avec succès:", trade);
      console.log("=== FIN MUTATION SERVEUR ===");
      return trade;
    }),

  updateAdvancedTrade: protectedProcedure
    .input(updateAdvancedTradeSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;
      const { id, ...updateData } = input;

      const [trade] = await db
        .update(advancedTrades)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(
          eq(advancedTrades.id, id),
          eq(advancedTrades.userId, userId)
        ))
        .returning();

      if (!trade) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trade non trouvé",
        });
      }

      return trade;
    }),

  deleteAdvancedTrade: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      await db
        .delete(advancedTrades)
        .where(and(
          eq(advancedTrades.id, input.id),
          eq(advancedTrades.userId, userId)
        ));

      return { success: true };
    }),

  // Mutation pour réorganiser les journaux
  reorderJournals: protectedProcedure
    .input(reorderJournalsSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session.userId;

      // Vérifier que tous les journaux appartiennent à l'utilisateur
      const journals = await db
        .select()
        .from(tradingJournals)
        .where(and(
          eq(tradingJournals.userId, userId),
          eq(tradingJournals.isActive, true)
        ));

      const journalIds = journals.map(j => j.id);
      const invalidIds = input.journalIds.filter(id => !journalIds.includes(id));
      
      if (invalidIds.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Certains journaux n'appartiennent pas à l'utilisateur",
        });
      }

      // Mettre à jour l'ordre des journaux
      for (let i = 0; i < input.journalIds.length; i++) {
        await db
          .update(tradingJournals)
          .set({ 
            order: i,
            updatedAt: new Date(),
          })
          .where(and(
            eq(tradingJournals.id, input.journalIds[i]),
            eq(tradingJournals.userId, userId)
          ));
      }

      return { success: true };
    }),
}); 