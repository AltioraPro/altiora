import { and, eq } from "drizzle-orm";
import { brokerConnections, tradingJournals } from "@/server/db/schema";
import type { GetSetupInfoContext } from "./types";

/**
 * Get MetaTrader setup information for a journal
 * Returns the webhook token and setup instructions if a connection exists
 */
export async function getSetupInfo({
    db,
    session,
    input,
}: GetSetupInfoContext) {
    const { journalId } = input;

    // 1. Verify journal ownership
    const journal = await db.query.tradingJournals.findFirst({
        where: and(
            eq(tradingJournals.id, journalId),
            eq(tradingJournals.userId, session.user.id)
        ),
    });

    if (!journal) {
        throw new Error("Journal not found or access denied");
    }

    // 2. Check if a MetaTrader connection exists
    const connection = await db.query.brokerConnections.findFirst({
        where: and(
            eq(brokerConnections.journalId, journalId),
            eq(brokerConnections.userId, session.user.id),
            eq(brokerConnections.provider, "metatrader")
        ),
    });

    if (!connection) {
        return {
            hasConnection: false,
            webhookToken: null,
            platform: null,
            brokerName: null,
            accountNumber: null,
            currency: null,
            lastSyncedAt: null,
            syncCount: 0,
            isActive: false,
        };
    }

    return {
        hasConnection: true,
        webhookToken: connection.webhookToken,
        platform: connection.platform,
        brokerName: connection.brokerName,
        accountNumber: connection.accountNumber,
        currency: connection.currency,
        lastSyncedAt: connection.lastSyncedAt,
        syncCount: Number.parseInt(connection.syncCount || "0", 10),
        isActive: connection.isActive,
    };
}
