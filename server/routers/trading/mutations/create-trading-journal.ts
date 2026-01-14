import { tradingJournals, tradingSessions } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createDefaultSessions } from "../utils/auto-sessions";
import { createTradingJournalSchema } from "../validators";

export const createTradingJournalBase = protectedProcedure.input(
    createTradingJournalSchema
);

export const createTradingJournalHandler = createTradingJournalBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const journalId = crypto.randomUUID();

        // Create journal
        const [journal] = await db
            .insert(tradingJournals)
            .values({
                id: journalId,
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

        // Create default trading sessions automatically
        const defaultSessions = createDefaultSessions(journalId, userId);
        await db.insert(tradingSessions).values(defaultSessions);

        return journal;
    }
);
