import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateTradingJournalSchema } from "../validators";

export const updateTradingJournalBase = protectedProcedure.input(
    updateTradingJournalSchema
);

export const updateTradingJournalHandler = updateTradingJournalBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;
        const { id, ...updateData } = input;

        const existingJournal = await db
            .select()
            .from(tradingJournals)
            .where(
                and(
                    eq(tradingJournals.id, id),
                    eq(tradingJournals.userId, userId)
                )
            )
            .limit(1);

        if (!existingJournal.length) {
            throw new ORPCError("NOT_FOUND", {
                message: "Trading journal not found",
            });
        }

        const [journal] = await db
            .update(tradingJournals)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(tradingJournals.id, id),
                    eq(tradingJournals.userId, userId)
                )
            )
            .returning();

        return journal;
    }
);
