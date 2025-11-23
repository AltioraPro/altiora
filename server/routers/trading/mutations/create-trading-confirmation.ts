import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { confirmations, tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createConfirmationSchema } from "../validators";

export const createConfirmationBase = protectedProcedure.input(
    createConfirmationSchema
);

export const createConfirmationHandler = createConfirmationBase.handler(
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

        const [confirmation] = await db
            .insert(confirmations)
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

        return confirmation;
    }
);
