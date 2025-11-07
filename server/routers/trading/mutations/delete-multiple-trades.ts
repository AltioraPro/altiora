import { ORPCError } from "@orpc/client";
import { and, eq, inArray } from "drizzle-orm";
import { advancedTrades } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { deleteMultipleTradesSchema } from "../validators";

export const deleteMultipleTradesBase = protectedProcedure.input(
    deleteMultipleTradesSchema
);

export const deleteMultipleTradesHandler = deleteMultipleTradesBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        if (input.tradeIds.length === 0) {
            throw new ORPCError("BAD_REQUEST", {
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
    }
);
