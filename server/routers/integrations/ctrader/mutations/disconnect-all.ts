import { and, eq, inArray } from "drizzle-orm";
import {
    account,
    brokerConnections,
    tradingJournals,
} from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { CTraderSyncCache } from "../utils/cache";

/**
 * Disconnect ALL cTrader connections for the user
 * This removes:
 * 1. ALL broker connections for all journals
 * 2. ALL cTrader-connected journals
 * 3. The OAuth account (from account table)
 */
export const disconnectAllCTraderBase = protectedProcedure;

export const disconnectAllCTraderHandler = disconnectAllCTraderBase.handler(
    async ({ context }) => {
        const { db, session } = context;
        const userId = session.user.id;

        // 1. Find all cTrader broker connections for this user
        const connections = await db.query.brokerConnections.findMany({
            where: and(
                eq(brokerConnections.userId, userId),
                eq(brokerConnections.provider, "ctrader")
            ),
        });

        const journalIds = connections
            .map((c) => c.journalId)
            .filter(Boolean) as string[];

        // 2. Delete all broker connections (hard delete)
        if (connections.length > 0) {
            await db
                .delete(brokerConnections)
                .where(
                    and(
                        eq(brokerConnections.userId, userId),
                        eq(brokerConnections.provider, "ctrader")
                    )
                );

            // Clear cache for all journals
            for (const conn of connections) {
                if (conn.journalId) {
                    await CTraderSyncCache.invalidate(conn.journalId);
                }
            }
        }

        // 3. Delete all cTrader-connected journals
        let deletedJournals = 0;
        if (journalIds.length > 0) {
            const result = await db
                .delete(tradingJournals)
                .where(
                    and(
                        inArray(tradingJournals.id, journalIds),
                        eq(tradingJournals.userId, userId)
                    )
                )
                .returning({ id: tradingJournals.id });
            deletedJournals = result.length;
        }

        // 4. Delete the OAuth account
        const deletedAccounts = await db
            .delete(account)
            .where(
                and(
                    eq(account.userId, userId),
                    eq(account.providerId, "ctrader")
                )
            )
            .returning({ id: account.id });

        return {
            success: true,
            message: "cTrader completely disconnected",
            deletedConnections: connections.length,
            deletedJournals,
            deletedAccounts: deletedAccounts.length,
        };
    }
);
