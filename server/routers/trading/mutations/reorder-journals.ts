import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { reorderJournalsSchema } from "../validators";

export const reorderJournalsBase = protectedProcedure.input(
    reorderJournalsSchema
);

export const reorderJournalsHandler = reorderJournalsBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const journals = await db
            .select()
            .from(tradingJournals)
            .where(
                and(
                    eq(tradingJournals.userId, userId),
                    eq(tradingJournals.isActive, true)
                )
            );

        const journalIds = journals.map((j) => j.id);
        const invalidIds = input.journalIds.filter(
            (id) => !journalIds.includes(id)
        );

        if (invalidIds.length > 0) {
            throw new ORPCError("BAD_REQUEST", {
                message: "Some journals do not belong to the user",
            });
        }

        for (let i = 0; i < input.journalIds.length; i++) {
            await db
                .update(tradingJournals)
                .set({
                    order: i,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(tradingJournals.id, input.journalIds[i]),
                        eq(tradingJournals.userId, userId)
                    )
                );
        }

        return { success: true };
    }
);
