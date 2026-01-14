import { and, eq } from "drizzle-orm";
import { account } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { EncryptionService } from "@/server/services/encryption.service";
import { getCTraderAccountsSchema } from "../schemas";
import { CTraderClient } from "../utils/ctrader-client";
import { CTraderRateLimiter } from "../utils/rate-limiter";

export const getCTraderAccountsBase = protectedProcedure.input(
    getCTraderAccountsSchema
);

export const getCTraderAccountsHandler = getCTraderAccountsBase.handler(
    async ({ context }) => {
        const { db, session } = context;

        // 1. Rate limiting
        const rateLimitResult = await CTraderRateLimiter.checkLimit(
            session.user.id
        );
        if (!rateLimitResult.allowed) {
            throw new Error(
                `Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000)}s`
            );
        }

        // 2. Get OAuth account
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

        // 3. Fetch accounts from cTrader
        const decryptedToken = EncryptionService.decrypt(
            oauthAccount.accessToken
        );
        const client = new CTraderClient(decryptedToken);
        const accounts = await client.getAccounts();

        return {
            success: true,
            accounts: accounts.map((acc) => ({
                accountId: acc.accountId,
                accountNumber: acc.accountNumber,
                brokerName: acc.brokerName,
                balance: acc.balance,
                currency: acc.currency,
                isLive: acc.isLive,
                leverage: acc.leverage,
            })),
        };
    }
);
