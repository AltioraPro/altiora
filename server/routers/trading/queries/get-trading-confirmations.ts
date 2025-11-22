import { and, eq, inArray } from "drizzle-orm";
import { confirmations } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { journalIdsSchema } from "../validators";

export const getTradingConfirmationsBase =
    protectedProcedure.input(journalIdsSchema);

export const getTradingConfirmationsHandler =
    getTradingConfirmationsBase.handler(async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const whereConditions = [
            eq(confirmations.userId, userId),
            eq(confirmations.isActive, true),
        ];

        if (input.journalId) {
            whereConditions.push(eq(confirmations.journalId, input.journalId));
        } else if (input.journalIds && input.journalIds.length > 0) {
            whereConditions.push(
                inArray(confirmations.journalId, input.journalIds)
            );
        }

        const tradingConfirmations = await db
            .select()
            .from(confirmations)
            .where(and(...whereConditions))
            .orderBy(confirmations.name);

        return tradingConfirmations;
    });
