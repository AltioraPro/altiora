import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  account,
  brokerConnections,
  tradingSessions,
} from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { EncryptionService } from "@/server/services/encryption.service";
import { createDefaultSessions } from "@/server/routers/trading/utils/auto-sessions";
import { connectCTraderAccountSchema } from "../schemas";
import { CTraderClient } from "../utils/ctrader-client";
import { CTraderRateLimiter } from "../utils/rate-limiter";

export const connectCTraderAccountBase = protectedProcedure.input(
  connectCTraderAccountSchema
);

export const connectCTraderAccountHandler = connectCTraderAccountBase.handler(
  async ({ context, input }) => {
    const { db, session } = context;
    const {
      journalId,
      brokerAccountId,
      accountNumber,
      brokerName,
      currency,
      accountType,
    } = input;

    // 1. Rate limiting
    const rateLimitResult = await CTraderRateLimiter.checkLimit(
      session.user.id
    );
    if (!rateLimitResult.allowed) {
      throw new Error(
        `Rate limit exceeded. Try again at ${rateLimitResult.resetAt.toISOString()}`
      );
    }

    // 2. Verify journal ownership
    const journal = await db.query.tradingJournals.findFirst({
      where: (journals, { eq, and }) =>
        and(eq(journals.id, journalId), eq(journals.userId, session.user.id)),
    });

    if (!journal) {
      throw new Error("Journal not found or access denied");
    }

    // 3. Check for existing connection
    const existingConnection = await db.query.brokerConnections.findFirst({
      where: eq(brokerConnections.journalId, journalId),
    });

    if (existingConnection) {
      throw new Error(
        `Journal already has a ${existingConnection.provider} connection. Disconnect it first.`
      );
    }

    // 4. Get OAuth account with access token
    const oauthAccount = await db.query.account.findFirst({
      where: and(
        eq(account.userId, session.user.id),
        eq(account.providerId, "ctrader")
      ),
    });

    if (!oauthAccount?.accessToken) {
      throw new Error(
        "No cTrader OAuth connection found. Please connect via OAuth first."
      );
    }

    // 5. Verify account access by fetching account details
    const decryptedToken = EncryptionService.decrypt(oauthAccount.accessToken);
    const client = new CTraderClient(decryptedToken);

    const accountDetails = await client.getAccountDetails(brokerAccountId);

    // 6. Create broker connection
    const [connection] = await db
      .insert(brokerConnections)
      .values({
        id: nanoid(),
        userId: session.user.id,
        journalId,
        provider: "ctrader",
        brokerName: brokerName || accountDetails.brokerName,
        brokerAccountId,
        accountNumber: accountNumber || accountDetails.accountNumber,
        accountType: accountType || (accountDetails.isLive ? "live" : "demo"),
        currency: currency || accountDetails.currency,
        isActive: true,
        lastSyncStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 7. Create default trading sessions if none exist
    const existingSessions = await db.query.tradingSessions.findFirst({
      where: eq(tradingSessions.journalId, journalId),
    });

    if (!existingSessions) {
      const defaultSessions = createDefaultSessions(journalId, session.user.id);
      await db.insert(tradingSessions).values(defaultSessions);
    }

    return {
      success: true,
      connection,
    };
  }
);
