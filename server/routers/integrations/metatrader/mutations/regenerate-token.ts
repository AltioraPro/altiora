import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { brokerConnections, tradingJournals } from "@/server/db/schema";
import type { RegenerateTokenContext } from "./types";

/**
 * Regenerates the webhook token for an existing MetaTrader connection
 * This invalidates the old token immediately
 */
export async function regenerateToken({ db, session, input }: RegenerateTokenContext) {
	const { journalId } = input;

	console.log(`[MT] Regenerating token for journal ${journalId}`);

	// 1. Verify journal ownership
	const journal = await db.query.tradingJournals.findFirst({
		where: and(
			eq(tradingJournals.id, journalId),
			eq(tradingJournals.userId, session.user.id)
		),
	});

	if (!journal) {
		console.warn(`[MT] Journal ${journalId} not found for regeneration`);
		throw new Error("Journal not found or access denied");
	}

	// 2. Find existing MetaTrader connection
	const existingConnection = await db.query.brokerConnections.findFirst({
		where: and(
			eq(brokerConnections.journalId, journalId),
			eq(brokerConnections.userId, session.user.id),
			eq(brokerConnections.provider, "metatrader")
		),
	});

	if (!existingConnection) {
		console.warn(`[MT] No connection found for journal ${journalId}`);
		throw new Error("No MetaTrader connection found for this journal");
	}

	// 3. Generate new token
	const newWebhookToken = `mt_${nanoid(32)}`;

	// 4. Update the connection with new token
	const [updatedConnection] = await db
		.update(brokerConnections)
		.set({
			webhookToken: newWebhookToken,
			updatedAt: new Date(),
		})
		.where(eq(brokerConnections.id, existingConnection.id))
		.returning();

	console.log(`[MT] Token regenerated for journal ${journalId}`);

	return {
		success: true,
		webhookToken: updatedConnection.webhookToken,
		message: "Token regenerated successfully. Update your EA with the new token.",
	};
}
