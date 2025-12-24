import { eq, and } from "drizzle-orm";
import { brokerConnections, tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

/**
 * Get all cTrader broker connections for the current user
 * Returns connections with journal names
 */
export const getCTraderConnectionsBase = protectedProcedure;

export const getCTraderConnectionsHandler = getCTraderConnectionsBase.handler(
	async ({ context }) => {
		const { db, session } = context;
		const userId = session.user.id;

		// Get all cTrader broker connections for this user
		const connections = await db
			.select({
				id: brokerConnections.id,
				journalId: brokerConnections.journalId,
				journalName: tradingJournals.name,
				provider: brokerConnections.provider,
				isActive: brokerConnections.isActive,
				lastSyncedAt: brokerConnections.lastSyncedAt,
				createdAt: brokerConnections.createdAt,
			})
			.from(brokerConnections)
			.leftJoin(tradingJournals, eq(brokerConnections.journalId, tradingJournals.id))
			.where(
				and(
					eq(brokerConnections.userId, userId),
					eq(brokerConnections.provider, "ctrader"),
				)
			);

		console.log(`[getCTraderConnections] Found ${connections.length} connections for user ${userId}`);

		return {
			success: true,
			connections: connections.map(c => ({
				id: c.id,
				journalId: c.journalId,
				journalName: c.journalName ?? "Unknown Journal",
				provider: c.provider,
				isActive: c.isActive,
				lastSyncedAt: c.lastSyncedAt,
				createdAt: c.createdAt,
			})),
		};
	}
);
