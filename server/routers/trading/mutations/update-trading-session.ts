import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingSessions } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateTradingSessionSchema } from "../validators";

export const updateTradingSessionBase = protectedProcedure.input(
    updateTradingSessionSchema
);

export const updateTradingSessionHandler = updateTradingSessionBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;
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
            throw new ORPCError("NOT_FOUND", {
                message: "Session not found",
            });
        }

        return tradingSession;
    }
);
