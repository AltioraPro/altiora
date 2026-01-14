import { and, eq } from "drizzle-orm";
import {
    account,
    brokerConnections,
    tradingJournals,
} from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { EncryptionService } from "@/server/services/encryption.service";
import { syncCTraderPositionsSchema } from "../schemas";
import { updateJournalCapital } from "../utils/asset-helpers";
import { CTraderSyncCache } from "../utils/cache";
import { CTraderClient } from "../utils/ctrader-client";
import { getAccountBalance } from "../utils/get-balance";
import { CTraderRateLimiter } from "../utils/rate-limiter";
import {
    closeRemovedPositions,
    syncDealsToAdvancedTrades,
} from "../utils/trade-mapper";

export const syncCTraderPositionsBase = protectedProcedure.input(
    syncCTraderPositionsSchema
);

export const syncCTraderPositionsHandler = syncCTraderPositionsBase.handler(
    async ({ context, input }) => {
        try {
            const { db, session } = context;
            const { journalId, forceRefresh } = input;

            // ... (rest of the code)
            // I will rewrite the whole block inside try/catch to be safe

            // 1. Rate limiting
            const rateLimitResult = await CTraderRateLimiter.checkLimit(
                session.user.id
            );
            if (!rateLimitResult.allowed) {
                throw new Error(
                    `Rate limit exceeded. Please wait ${Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000)} seconds.`
                );
            }

            const connections = await db
                .select()
                .from(brokerConnections)
                .where(
                    and(
                        eq(brokerConnections.journalId, journalId),
                        eq(brokerConnections.provider, "ctrader"),
                        eq(brokerConnections.userId, session.user.id)
                    )
                )
                .limit(1);

            const connection = connections[0];

            if (!connection) {
                console.error(
                    "[syncCTraderPositions] No cTrader connection found"
                );
                throw new Error("No cTrader connection found for this journal");
            }

            if (!connection.isActive) {
                console.error("[syncCTraderPositions] Connection inactive");
                throw new Error("cTrader connection is inactive");
            }

            // 3. Check cache (skip if forceRefresh)
            // 3. Check cache (skip if forceRefresh)
            if (false) {
                // DISABLED FOR DEBUGGING TO FORCE SYNC
                const cached = await CTraderSyncCache.get(journalId);
                if (cached) {
                    return {
                        success: true,
                        cached: true,
                        created: 0,
                        updated: 0,
                        closed: 0,
                        totalPositions: cached?.count ?? 0,
                        errors: [],
                    };
                }
            } else {
                await CTraderSyncCache.invalidate(journalId);
            }
            const accounts = await db
                .select()
                .from(account)
                .where(
                    and(
                        eq(account.userId, session.user.id),
                        eq(account.providerId, "ctrader")
                    )
                )
                .limit(1);

            const oauthAccount = accounts[0];

            if (!oauthAccount?.accessToken) {
                console.error("[syncCTraderPositions] OAuth token missing");
                throw new Error(
                    "cTrader OAuth token not found. Please reconnect."
                );
            }
            const decryptedToken = EncryptionService.decrypt(
                oauthAccount.accessToken
            );
            const client = new CTraderClient(decryptedToken);
            const accountList = await client.getAccountList();

            if (accountList.length === 0) {
                console.error(
                    "[syncCTraderPositions] No training accounts found for this access token"
                );
                throw new Error(
                    "No cTrader trading accounts found. Please make sure you have a live/demo account linked."
                );
            }

            // For now, use the first account found.
            // TODO: Allow user to select which account to sync in the UI if multiple exist.
            const tradingAccountId = accountList[0].accountId;
            const isLive = accountList[0].isLive;
            let accountBalance = await getAccountBalance(
                decryptedToken,
                tradingAccountId,
                isLive
            );

            // Fallback to journal starting capital if balance is 0 or unavailable
            if (!accountBalance || accountBalance === 0) {
                console.warn(
                    "[syncCTraderPositions] cTrader balance is 0 or unavailable, fetching journal capital..."
                );
                const journal = await db.query.tradingJournals.findFirst({
                    where: eq(tradingJournals.id, journalId),
                    columns: { startingCapital: true },
                });
                accountBalance = journal?.startingCapital
                    ? Number(journal.startingCapital)
                    : 0;
            }
            const positions: any[] = [];
            const now = new Date();
            // Start from 2015 to get ALL TIME history (cTrader launched ~2015)
            let fromDate = new Date("2015-01-01T00:00:00Z");

            // Only use lastSyncedAt for incremental syncs if it's more than 1 day old
            if (connection.lastSyncedAt && !forceRefresh) {
                const lastSync = new Date(connection.lastSyncedAt);
                const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                // Only use lastSyncedAt if it's more than 1 day old
                if (lastSync < oneDayAgo) {
                    fromDate = lastSync;
                    fromDate.setMinutes(fromDate.getMinutes() - 10);
                }
            }

            const deals = await client.getDealHistory(
                tradingAccountId,
                fromDate.toISOString(),
                now.toISOString(),
                isLive
            );

            // 6. Cache positions (Only cache empty positions list or maybe don't cache?)
            // await CTraderSyncCache.set(journalId, positions);

            // 7. Sync to database

            // 7a. Sync Open Positions - SKIPPED
            // console.log("[syncCTraderPositions] Mapping positions to DB");
            const positionResult = { created: 0, updated: 0, errors: [] };
            const dealResult = await syncDealsToAdvancedTrades(
                db,
                deals,
                journalId,
                session.user.id,
                tradingAccountId,
                accountBalance
            );

            // 8. Close positions that are no longer open
            // Since positions list is empty (user disabled open trades), this will close ALL previously open positions in DB.
            const currentPositionIds: string[] = [];
            const closedCount = await closeRemovedPositions(
                db,
                currentPositionIds,
                journalId
            );

            const allErrors = [
                ...(positionResult.errors || []),
                ...dealResult.errors,
            ];

            // 9. Update connection status and account type
            await db
                .update(brokerConnections)
                .set({
                    lastSyncedAt: new Date(),
                    lastSyncStatus: allErrors.length > 0 ? "error" : "success",
                    lastSyncError:
                        allErrors.length > 0
                            ? allErrors.join("; ").substring(0, 255)
                            : null,
                    syncCount: (
                        Number(connection.syncCount || 0) + 1
                    ).toString(),
                    // Update accountType in case it changed or wasn't set correctly
                    accountType: isLive ? "live" : "demo",
                    updatedAt: new Date(),
                })
                .where(eq(brokerConnections.id, connection.id));

            // 10. Update journal capital
            if (accountBalance > 0) {
                await updateJournalCapital(db, journalId, accountBalance);
            }

            return {
                success: true,
                cached: false,
                created: positionResult.created + dealResult.created,
                updated: positionResult.updated + dealResult.updated,
                closed: closedCount,
                totalPositions: positions.length + deals.length,
                errors: allErrors,
            };
        } catch (error) {
            console.error(
                "[syncCTraderPositions] CRITICAL ERROR during sync:",
                error
            );
            // Re-throw to inform client, or return error object?
            // Since this is RPC, throwing is fine if we want 500/400.
            // But maybe the client prefers a success: false response to show the error nicely.

            // Let's rethrow for now but at least we have the LOG.
            throw error;
        }
    }
);
