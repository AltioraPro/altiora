import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  brokerConnections,
  tradingJournals,
  tradingSessions,
} from "@/server/db/schema";
import { createDefaultSessions } from "@/server/routers/trading/utils/auto-sessions";
import type { GenerateWebhookTokenContext } from "./types";

/**
 * Generates a secure webhook token for MetaTrader EA authentication
 * Creates a new broker connection if none exists, or returns existing token
 */
export async function generateWebhookToken({
  db,
  session,
  input,
}: GenerateWebhookTokenContext) {
  const { journalId, platform } = input;

  // 1. Verify journal ownership
  const journal = await db.query.tradingJournals.findFirst({
    where: and(
      eq(tradingJournals.id, journalId),
      eq(tradingJournals.userId, session.user.id)
    ),
  });

  if (!journal) {
    console.warn(
      `[MT] Journal ${journalId} not found for user ${session.user.id}`
    );
    throw new Error("Journal not found or access denied");
  }

  // 2. Check for existing connection (any provider)
  const existingConnection = await db.query.brokerConnections.findFirst({
    where: eq(brokerConnections.journalId, journalId),
  });

  if (existingConnection) {
    // If it's already a MetaTrader connection, return existing token
    if (existingConnection.provider === "metatrader") {
      return {
        success: true,
        webhookToken: existingConnection.webhookToken,
        isNew: false,
        message: "Existing MetaTrader connection found",
      };
    }

    // If it's a different provider, block
    throw new Error(
      `Journal already has a ${existingConnection.provider} connection. Disconnect it first.`
    );
  }

  // 3. Generate a secure webhook token
  const webhookToken = `mt_${nanoid(32)}`;

  // 4. Create the broker connection
  const [connection] = await db
    .insert(brokerConnections)
    .values({
      id: nanoid(),
      userId: session.user.id,
      journalId,
      provider: "metatrader",
      platform,
      webhookToken,
      isActive: true,
      lastSyncStatus: "pending",
      syncCount: "0",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // 5. Create default trading sessions if none exist
  const existingSessions = await db.query.tradingSessions.findFirst({
    where: eq(tradingSessions.journalId, journalId),
  });

  if (!existingSessions) {
    const defaultSessions = createDefaultSessions(journalId, session.user.id);
    await db.insert(tradingSessions).values(defaultSessions);
  }

  return {
    success: true,
    webhookToken: connection.webhookToken,
    isNew: true,
    message: "MetaTrader connection created successfully",
  };
}
