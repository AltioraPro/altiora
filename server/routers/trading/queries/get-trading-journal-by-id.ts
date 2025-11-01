import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { idSchema } from "../validators";

export const getTradingJournalByIdBase = protectedProcedure.input(idSchema);

export const getTradingJournalByIdHandler = getTradingJournalByIdBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const [journal] = await db
            .select()
            .from(tradingJournals)
            .where(
                and(
                    eq(tradingJournals.id, input.id),
                    eq(tradingJournals.userId, userId)
                )
            )
            .limit(1);

        if (!journal) {
            throw new ORPCError("NOT_FOUND", {
                message: "Trading journal not found",
            });
        }

        return journal;
    }
);
