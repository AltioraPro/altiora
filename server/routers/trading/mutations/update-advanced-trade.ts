import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { advancedTrades, tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { calculateTradeResults } from "@/server/services/trade-calculation";
import { updateAdvancedTradeSchema } from "../validators";

export const updateAdvancedTradeBase = protectedProcedure.input(
  updateAdvancedTradeSchema
);

export const updateAdvancedTradeHandler = updateAdvancedTradeBase.handler(
  async ({ context, input }) => {
    const { db, session } = context;
    const userId = session.user.id;
    const { id, ...updateData } = input;

    const existingTrade = await db
      .select()
      .from(advancedTrades)
      .where(and(eq(advancedTrades.id, id), eq(advancedTrades.userId, userId)))
      .limit(1);

    if (!existingTrade.length) {
      throw new ORPCError("NOT_FOUND", {
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
      throw new ORPCError("NOT_FOUND", {
        message: "Trading journal not found",
      });
    }

    const calculatedResults = calculateTradeResults(
      {
        profitLossAmount: updateData.profitLossAmount
          ? String(updateData.profitLossAmount)
          : undefined,
        profitLossPercentage: updateData.profitLossPercentage
          ? String(updateData.profitLossPercentage)
          : undefined,
        exitReason: updateData.exitReason,
      },
      journal[0]
    );

    const [updatedTrade] = await db
      .update(advancedTrades)
      .set({
        ...updateData,
        ...calculatedResults,
        tradeDate: updateData.tradeDate
          ? new Date(updateData.tradeDate)
          : existingTrade[0].tradeDate,
        updatedAt: new Date(),
      })
      .where(and(eq(advancedTrades.id, id), eq(advancedTrades.userId, userId)))
      .returning();

    return updatedTrade;
  }
);
