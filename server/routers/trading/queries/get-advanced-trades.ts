import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { advancedTrades } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { filterTradesSchema } from "../validators";

export const getAdvancedTradesBase =
    protectedProcedure.input(filterTradesSchema);

export const getAdvancedTradesHandler = getAdvancedTradesBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const whereConditions = [eq(advancedTrades.userId, userId)];

        if (input.journalId) {
            whereConditions.push(eq(advancedTrades.journalId, input.journalId));
        } else if (input.journalIds && input.journalIds.length > 0) {
            whereConditions.push(
                inArray(advancedTrades.journalId, input.journalIds)
            );
        }
        if (input.assetId) {
            whereConditions.push(eq(advancedTrades.assetId, input.assetId));
        } else if (input.assetIds && input.assetIds.length > 0) {
            whereConditions.push(
                inArray(advancedTrades.assetId, input.assetIds)
            );
        }
        if (input.sessionId) {
            whereConditions.push(eq(advancedTrades.sessionId, input.sessionId));
        } else if (input.sessionIds && input.sessionIds.length > 0) {
            whereConditions.push(
                inArray(advancedTrades.sessionId, input.sessionIds)
            );
        }
        if (input.confirmationId) {
            whereConditions.push(
                eq(advancedTrades.confirmationId, input.confirmationId)
            );
        } else if (input.confirmationIds && input.confirmationIds.length > 0) {
            whereConditions.push(
                inArray(advancedTrades.confirmationId, input.confirmationIds)
            );
        }
        if (input.startDate) {
            whereConditions.push(
                gte(advancedTrades.tradeDate, new Date(input.startDate))
            );
        }
        if (input.endDate) {
            whereConditions.push(
                lte(advancedTrades.tradeDate, new Date(input.endDate))
            );
        }
        if (input.isClosed !== undefined) {
            whereConditions.push(eq(advancedTrades.isClosed, input.isClosed));
        }

        const trades = input.limit
            ? await db
                  .select()
                  .from(advancedTrades)
                  .where(and(...whereConditions))
                  .orderBy(
                      desc(advancedTrades.tradeDate),
                      desc(advancedTrades.createdAt)
                  )
                  .limit(input.limit)
                  .offset(input.offset || 0)
            : await db
                  .select()
                  .from(advancedTrades)
                  .where(and(...whereConditions))
                  .orderBy(
                      desc(advancedTrades.tradeDate),
                      desc(advancedTrades.createdAt)
                  );

        return trades;
    }
);
