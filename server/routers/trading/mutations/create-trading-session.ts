import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingJournals, tradingSessions } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createTradingSessionSchema } from "../validators";

export const createTradingSessionBase = protectedProcedure.input(
    createTradingSessionSchema
);

export const createTradingSessionHandler = createTradingSessionBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

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
    }
);
