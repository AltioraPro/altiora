import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingSessions } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { idSchema } from "../validators";

export const getTradingSessionByIdBase = protectedProcedure.input(idSchema);

export const getTradingSessionByIdHandler = getTradingSessionByIdBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const [tradingSession] = await db
            .select()
            .from(tradingSessions)
            .where(
                and(
                    eq(tradingSessions.id, input.id),
                    eq(tradingSessions.userId, userId)
                )
            )
            .limit(1);

        if (!tradingSession) {
            throw new ORPCError("NOT_FOUND", {
                message: "Session not found",
            });
        }

        return tradingSession;
    }
);
