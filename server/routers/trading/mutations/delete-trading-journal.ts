import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { idSchema } from "../validators";

export const deleteTradingJournalBase = protectedProcedure.input(idSchema);

export const deleteTradingJournalHandler = deleteTradingJournalBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const existingJournal = await db
            .select()
            .from(tradingJournals)
            .where(
                and(
                    eq(tradingJournals.id, input.id),
                    eq(tradingJournals.userId, userId)
                )
            )
            .limit(1);

        if (!existingJournal.length) {
            throw new ORPCError("NOT_FOUND", {
                message: "Trading journal not found",
            });
        }

        await db
            .delete(tradingJournals)
            .where(
                and(
                    eq(tradingJournals.id, input.id),
                    eq(tradingJournals.userId, userId)
                )
            );

        return { success: true };
    }
);
