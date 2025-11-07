import { and, eq, inArray } from "drizzle-orm";
import { tradingSessions } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { journalIdsSchema } from "../validators";

export const getTradingSessionsBase =
    protectedProcedure.input(journalIdsSchema);

export const getTradingSessionsHandler = getTradingSessionsBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const whereConditions = [
            eq(tradingSessions.userId, userId),
            eq(tradingSessions.isActive, true),
        ];

        if (input.journalId) {
            whereConditions.push(
                eq(tradingSessions.journalId, input.journalId)
            );
        } else if (input.journalIds && input.journalIds.length > 0) {
            whereConditions.push(
                inArray(tradingSessions.journalId, input.journalIds)
            );
        }

        const sessions = await db
            .select()
            .from(tradingSessions)
            .where(and(...whereConditions))
            .orderBy(tradingSessions.name);

        return sessions;
    }
);
