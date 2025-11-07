import { ORPCError } from "@orpc/client";
import { and, asc, eq } from "drizzle-orm";
import {
    advancedTrades,
    tradingAssets,
    tradingJournals,
} from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { calculateTradeResults } from "@/server/services/trade-calculation";
import { createAdvancedTradeSchema } from "../validators";

export const createAdvancedTradeBase = protectedProcedure.input(
    createAdvancedTradeSchema
);

export const createAdvancedTradeHandler = createAdvancedTradeBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

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
            throw new ORPCError("NOT_FOUND", {
                message: "Trading journal not found",
            });
        }

        let assetId = input.assetId;
        if (!assetId && input.symbol) {
            console.log("Recherche de l'asset avec le symbol:", input.symbol);
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
                        eq(advancedTrades.journalId, input.journalId),
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
    }
);
