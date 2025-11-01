import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingJournals, tradingSetups } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createTradingSetupSchema } from "../validators";

export const createTradingSetupBase = protectedProcedure.input(
    createTradingSetupSchema
);

export const createTradingSetupHandler = createTradingSetupBase.handler(
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
    }
);
