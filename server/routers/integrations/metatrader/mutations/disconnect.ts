import { eq, and } from "drizzle-orm";
import { brokerConnections, tradingJournals } from "@/server/db/schema";
import type { MetaTraderMutationContext } from "./types";

interface DisconnectContext extends MetaTraderMutationContext {
	input: { journalId: string };
}

/**
 * Disconnects a MetaTrader integration from a journal
 * This does NOT delete the trades, only the connection
 */
export async function disconnect({ db, session, input }: DisconnectContext) {
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

	// 2. Find and delete the MetaTrader connection
	const deleted = await db
		.delete(brokerConnections)
		.where(
			and(
				eq(brokerConnections.journalId, journalId),
				eq(brokerConnections.userId, session.user.id),
				eq(brokerConnections.provider, "metatrader")
			)
		)
		.returning();

	if (deleted.length === 0) {
		throw new Error("No MetaTrader connection found for this journal");
	}


	return {
		success: true,
		message: "MetaTrader connection removed. Your trades are still in the journal.",
	};
}

