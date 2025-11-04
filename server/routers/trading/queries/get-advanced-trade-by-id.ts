import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { advancedTrades } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { idSchema } from "../validators";

export const getAdvancedTradeByIdBase = protectedProcedure.input(idSchema);

export const getAdvancedTradeByIdHandler = getAdvancedTradeByIdBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

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
            throw new ORPCError("NOT_FOUND", {
                message: "Trade not found",
            });
        }

        return trade;
    }
);
