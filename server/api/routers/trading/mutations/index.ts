import { TRPCError } from "@trpc/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import {
    advancedTrades,
    tradingAssets,
    tradingJournals,
    tradingSessions,
    tradingSetups,
} from "@/server/db/schema";
import { calculateTradeResults } from "@/server/services/trade-calculation";
import {
    createAdvancedTradeSchema,
    createTradingAssetSchema,
    createTradingJournalSchema,
    createTradingSessionSchema,
    createTradingSetupSchema,
    reorderJournalsSchema,
    updateAdvancedTradeSchema,
    updateTradingAssetSchema,
    updateTradingJournalSchema,
    updateTradingSessionSchema,
    updateTradingSetupSchema,
} from "../validators";

export const tradingMutationsRouter = createTRPCRouter({
    createTradingJournal: protectedProcedure
        .input(createTradingJournalSchema)
        .mutation(async ({ ctx, input }) => {
            const { session } = ctx;
            const userId = session.userId;

            const [journal] = await db
                .insert(tradingJournals)
                .values({
                    id: crypto.randomUUID(),
                    userId,
                    name: input.name,
                    description: input.description,
                    startingCapital: input.startingCapital,
                    usePercentageCalculation:
                        input.usePercentageCalculation ?? false,
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

            const existingJournal = await db
                .select()
                .from(tradingJournals)
                .where(
                    and(
                        eq(tradingJournals.id, id),
                        eq(tradingJournals.userId, userId)
                    )
                )
                .limit(1);

            if (!existingJournal.length) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Trading journal not found",
                });
            }

            const [journal] = await db
                .update(tradingJournals)
                .set({
                    ...updateData,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(tradingJournals.id, id),
                        eq(tradingJournals.userId, userId)
                    )
                )
                .returning();

            return journal;
        }),

    deleteTradingJournal: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { session } = ctx;
            const userId = session.userId;

            const existingJournal = await db
                .select()
                .from(tradingJournals)
                .where(
                    and(
                        eq(tradingJournals.id, input.id),
                        eq(tradingJournals.userId, userId)
                    )
                )
                .limit(1);

            if (!existingJournal.length) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Trading journal not found",
                });
            }

            await db
                .delete(tradingJournals)
                .where(
                    and(
                        eq(tradingJournals.id, input.id),
                        eq(tradingJournals.userId, userId)
                    )
                );

            return { success: true };
        }),

    createTradingAsset: protectedProcedure
        .input(createTradingAssetSchema)
        .mutation(async ({ ctx, input }) => {
            const { session } = ctx;
            const userId = session.userId;

            const journal = await db
                .select()
                .from(tradingJournals)
                .where(
                    and(
                        eq(tradingJournals.id, input.journalId),
                        eq(tradingJournals.userId, userId)
                    )
                )
                .limit(1);

            if (!journal.length) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Trading journal not found",
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
                .where(
                    and(
                        eq(tradingAssets.id, id),
                        eq(tradingAssets.userId, userId)
                    )
                )
                .returning();

            if (!asset) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Asset not found",
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
                .where(
                    and(
                        eq(tradingAssets.id, input.id),
                        eq(tradingAssets.userId, userId)
                    )
                );

            return { success: true };
        }),

    createTradingSession: protectedProcedure
        .input(createTradingSessionSchema)
        .mutation(async ({ ctx, input }) => {
            const { session } = ctx;
            const userId = session.userId;

            const journal = await db
                .select()
                .from(tradingJournals)
                .where(
                    and(
                        eq(tradingJournals.id, input.journalId),
                        eq(tradingJournals.userId, userId)
                    )
                )
                .limit(1);

            if (!journal.length) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Trading journal not found",
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
                .where(
                    and(
                        eq(tradingSessions.id, id),
                        eq(tradingSessions.userId, userId)
                    )
                )
                .returning();

            if (!tradingSession) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Session not found",
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
                .where(
                    and(
                        eq(tradingSessions.id, input.id),
                        eq(tradingSessions.userId, userId)
                    )
                );

            return { success: true };
        }),

    createTradingSetup: protectedProcedure
        .input(createTradingSetupSchema)
        .mutation(async ({ ctx, input }) => {
            const { session } = ctx;
            const userId = session.userId;

            const journal = await db
                .select()
                .from(tradingJournals)
                .where(
                    and(
                        eq(tradingJournals.id, input.journalId),
                        eq(tradingJournals.userId, userId)
                    )
                )
                .limit(1);

            if (!journal.length) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Trading journal not found",
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
                .where(
                    and(
                        eq(tradingSetups.id, id),
                        eq(tradingSetups.userId, userId)
                    )
                )
                .returning();

            if (!setup) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Setup not found",
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
                .where(
                    and(
                        eq(tradingSetups.id, input.id),
                        eq(tradingSetups.userId, userId)
                    )
                );

            return { success: true };
        }),

    createAdvancedTrade: protectedProcedure
        .input(createAdvancedTradeSchema)
        .mutation(async ({ ctx, input }) => {
            const { session } = ctx;
            const userId = session.userId;

            console.log("=== DÉBUT MUTATION SERVEUR ===");
            console.log("Création de trade avec les données:", input);
            console.log("UserId:", userId);
            console.log("Session:", session);

            console.log("Recherche du journal avec ID:", input.journalId);
            const journal = await db
                .select()
                .from(tradingJournals)
                .where(
                    and(
                        eq(tradingJournals.id, input.journalId),
                        eq(tradingJournals.userId, userId)
                    )
                )
                .limit(1);

            console.log("Journal trouvé:", journal);

            if (!journal.length) {
                console.error("Journal non trouvé pour l'utilisateur");
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Trading journal not found",
                });
            }

            let assetId = input.assetId;
            if (!assetId && input.symbol) {
                console.log(
                    "Recherche de l'asset avec le symbol:",
                    input.symbol
                );
                const asset = await db
                    .select()
                    .from(tradingAssets)
                    .where(
                        and(
                            eq(tradingAssets.symbol, input.symbol),
                            eq(tradingAssets.journalId, input.journalId),
                            eq(tradingAssets.userId, userId)
                        )
                    )
                    .limit(1);

                console.log("Asset trouvé:", asset);
                assetId = asset[0]?.id;
            }

            console.log("Insertion du trade dans la base de données...");

            const cleanRiskInput = input.riskInput
                ? String(input.riskInput).replace(/[%,]/g, "").trim()
                : null;
            let currentCapital: number | undefined;
            if (
                journal[0].usePercentageCalculation &&
                journal[0].startingCapital
            ) {
                const startingCapital = Number.parseFloat(
                    journal[0].startingCapital
                );

                const closedTradesData = await db
                    .select({
                        profitLossPercentage:
                            advancedTrades.profitLossPercentage,
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

                const totalPnLPercentage = closedTradesData.reduce(
                    (sum, trade) => {
                        const pnlPercentage = trade.profitLossPercentage
                            ? Number.parseFloat(trade.profitLossPercentage) || 0
                            : 0;
                        return sum + pnlPercentage;
                    },
                    0
                );

                currentCapital =
                    startingCapital +
                    (totalPnLPercentage / 100) * startingCapital;

                console.log("Capital actuel calculé avec addition simple:", {
                    startingCapital,
                    tradesCount: closedTradesData.length,
                    totalPnLPercentage,
                    currentCapital,
                });
            }

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
                symbol: input.symbol || "",
                riskInput: cleanRiskInput,
                profitLossAmount: calculatedResults.profitLossAmount || null,
                profitLossPercentage: calculatedResults.profitLossPercentage,
                exitReason: calculatedResults.exitReason,
                breakEvenThreshold: "0.1",
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

    deleteAdvancedTrade: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { session } = ctx;
            const userId = session.userId;

            await db
                .delete(advancedTrades)
                .where(
                    and(
                        eq(advancedTrades.id, input.id),
                        eq(advancedTrades.userId, userId)
                    )
                );

            return { success: true };
        }),

    updateAdvancedTrade: protectedProcedure
        .input(updateAdvancedTradeSchema)
        .mutation(async ({ ctx, input }) => {
            const { session } = ctx;
            const userId = session.userId;
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
                throw new TRPCError({
                    code: "NOT_FOUND",
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
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Trading journal not found",
                });
            }

            let currentCapital: number | undefined;
            if (
                journal[0].usePercentageCalculation &&
                journal[0].startingCapital
            ) {
                const startingCapital = Number.parseFloat(
                    journal[0].startingCapital
                );

                const closedTradesData = await db
                    .select({
                        profitLossPercentage:
                            advancedTrades.profitLossPercentage,
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

                const totalPnLPercentage = closedTradesData.reduce(
                    (sum, trade) => {
                        const pnlPercentage = trade.profitLossPercentage
                            ? Number.parseFloat(trade.profitLossPercentage) || 0
                            : 0;
                        return sum + pnlPercentage;
                    },
                    0
                );

                currentCapital =
                    startingCapital +
                    (totalPnLPercentage / 100) * startingCapital;
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
        }),

    deleteMultipleTrades: protectedProcedure
        .input(z.object({ tradeIds: z.array(z.string()) }))
        .mutation(async ({ ctx, input }) => {
            const { session } = ctx;
            const userId = session.userId;

            if (input.tradeIds.length === 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No trade IDs provided",
                });
            }

            await db
                .delete(advancedTrades)
                .where(
                    and(
                        inArray(advancedTrades.id, input.tradeIds),
                        eq(advancedTrades.userId, userId)
                    )
                );

            return { success: true, deletedCount: input.tradeIds.length };
        }),

    reorderJournals: protectedProcedure
        .input(reorderJournalsSchema)
        .mutation(async ({ ctx, input }) => {
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
                );

            const journalIds = journals.map((j) => j.id);
            const invalidIds = input.journalIds.filter(
                (id) => !journalIds.includes(id)
            );

            if (invalidIds.length > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Some journals do not belong to the user",
                });
            }

            for (let i = 0; i < input.journalIds.length; i++) {
                await db
                    .update(tradingJournals)
                    .set({
                        order: i,
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(tradingJournals.id, input.journalIds[i]),
                            eq(tradingJournals.userId, userId)
                        )
                    );
            }

            return { success: true };
        }),
});
