import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import {
    advancedTrades,
    tradesConfirmations,
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

        try {
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
                throw new ORPCError("NOT_FOUND", {
                    message: "Trading journal not found",
                });
            }

            let assetId = input.assetId;
            if (!assetId) {
                const asset = await db
                    .select()
                    .from(tradingAssets)
                    .where(
                        and(
                            eq(tradingAssets.journalId, input.journalId),
                            eq(tradingAssets.userId, userId)
                        )
                    )
                    .limit(1);

                assetId = asset[0]?.id;
            }

            const calculatedResults = calculateTradeResults(
                {
                    profitLossAmount: input.profitLossAmount
                        ? String(input.profitLossAmount)
                        : undefined,
                    profitLossPercentage: input.profitLossPercentage
                        ? String(input.profitLossPercentage)
                        : undefined,
                    exitReason: input.exitReason,
                },
                journal[0]
            );

            const tradeValues = {
                id: crypto.randomUUID(),
                userId,
                journalId: input.journalId,
                assetId,
                sessionId: input.sessionId,
                tradeDate: new Date(input.tradeDate),
                riskInput: input.riskInput,
                profitLossAmount: calculatedResults.profitLossAmount,
                profitLossPercentage: calculatedResults.profitLossPercentage,
                exitReason: calculatedResults.exitReason,
                breakEvenThreshold: "0.1",
                tradingviewLink: input.tradingviewLink,
                notes: input.notes,
                isClosed: input.isClosed ?? true,
            };

            const [trade] = await db
                .insert(advancedTrades)
                .values(tradeValues)
                .returning();

            const confirmationValues = input.confirmationIds?.map(
                (confirmationId) => ({
                    id: crypto.randomUUID(),
                    userId,
                    advancedTradeId: trade.id,
                    confirmationId,
                })
            );

            if (confirmationValues && confirmationValues.length > 0) {
                await db.insert(tradesConfirmations).values(confirmationValues);
            }

            return trade;
        } catch (error) {
            console.error(error);
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to create trade",
            });
        }
    }
);
