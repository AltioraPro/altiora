import { eq, and } from "drizzle-orm";
import { brokerConnections, tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { CTraderSyncCache } from "../utils/cache";
import { disconnectCTraderAccountSchema } from "../schemas";

export const disconnectCTraderAccountBase = protectedProcedure.input(
	disconnectCTraderAccountSchema,
);

export const disconnectCTraderAccountHandler =
	disconnectCTraderAccountBase.handler(async ({ context, input }) => {
		const { db, session } = context;
		const { journalId } = input;

		// 1. Verify connection ownership
		const connection = await db.query.brokerConnections.findFirst({
			where: and(
				eq(brokerConnections.journalId, journalId),
				eq(brokerConnections.provider, "ctrader"),
				eq(brokerConnections.userId, session.user.id),
			),
		});

		if (!connection) {
			throw new Error("No cTrader connection found for this journal");
		}

		// 2. Delete broker connection (hard delete)
		await db
			.delete(brokerConnections)
			.where(eq(brokerConnections.id, connection.id));

		// 3. Delete the journal itself
		await db
			.delete(tradingJournals)
			.where(
				and(
					eq(tradingJournals.id, journalId),
					eq(tradingJournals.userId, session.user.id),
				)
			);

		// 4. Clear cache
		await CTraderSyncCache.invalidate(journalId);

		console.log(`[disconnectCTrader] Deleted journal ${journalId} and its broker connection`);

		return {
			success: true,
			message: "cTrader account and journal deleted successfully",
		};
	});
