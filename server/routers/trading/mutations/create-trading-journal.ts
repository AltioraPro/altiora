import { tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createTradingJournalSchema } from "../validators";

export const createTradingJournalBase = protectedProcedure.input(
    createTradingJournalSchema
);

export const createTradingJournalHandler = createTradingJournalBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const [journal] = await db
            .insert(tradingJournals)
            .values({
                id: crypto.randomUUID(),
                userId,
                name: input.name,
                description: input.description,
                startingCapital: input.startingCapital,
                usePercentageCalculation:
                    input.usePercentageCalculation ?? false,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return journal;
    }
);
