import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import {
    advancedTrades,
    brokerConnections,
    tradingJournals,
    tradingSessions,
} from "@/server/db/schema";
import { getOrCreateAsset } from "@/server/routers/integrations/metatrader/utils";
import { metatraderWebhookPayloadSchema } from "@/server/routers/integrations/metatrader/validators";
import { determineSessionFromTime } from "@/server/routers/trading/utils/auto-sessions";

/**
 * MetaTrader Webhook Endpoint
 *
 * Receives trade data from MT4/MT5 Expert Advisors
 * Authentication is done via the x-user-token header
 *
 * POST /api/integrations/metatrader/webhook
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // 1. Get token from header
        const token = request.headers.get("x-user-token");

        if (!token) {
            console.warn("[MT Webhook] Missing x-user-token header");
            return NextResponse.json(
                {
                    error: "Missing authentication token",
                    code: "MISSING_TOKEN",
                },
                { status: 401 }
            );
        }

        // 2. Parse and validate the payload
        let payload: unknown;
        try {
            payload = await request.json();
        } catch {
            console.warn("[MT Webhook] Invalid JSON payload");
            return NextResponse.json(
                { error: "Invalid JSON payload", code: "INVALID_JSON" },
                { status: 400 }
            );
        }

        const validationResult =
            metatraderWebhookPayloadSchema.safeParse(payload);

        if (!validationResult.success) {
            console.warn(
                "[MT Webhook] Validation failed:",
                validationResult.error.issues
            );
            return NextResponse.json(
                {
                    error: "Invalid payload format",
                    code: "VALIDATION_ERROR",
                    details: validationResult.error.issues,
                },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // 3. Validate token matches payload token
        if (token !== data.token) {
            console.warn("[MT Webhook] Token mismatch: header vs payload");
            return NextResponse.json(
                { error: "Token mismatch", code: "TOKEN_MISMATCH" },
                { status: 401 }
            );
        }

        // 4. Look up the broker connection by webhook token
        const connection = await db.query.brokerConnections.findFirst({
            where: and(
                eq(brokerConnections.webhookToken, token),
                eq(brokerConnections.provider, "metatrader"),
                eq(brokerConnections.isActive, true)
            ),
        });

        if (!connection) {
            console.warn(
                "[MT Webhook] Invalid or inactive token:",
                `${token.substring(0, 10)}...`
            );
            return NextResponse.json(
                { error: "Invalid or inactive token", code: "INVALID_TOKEN" },
                { status: 401 }
            );
        }

        // 5. Check for duplicate trade (same ticket for the same journal)
        const existingTrade = await db.query.advancedTrades.findFirst({
            where: and(
                eq(advancedTrades.journalId, connection.journalId),
                eq(advancedTrades.externalId, String(data.ticket)),
                eq(advancedTrades.source, "metatrader")
            ),
        });

        if (existingTrade) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Trade already exists",
                    tradeId: existingTrade.id,
                    duplicate: true,
                },
                { status: 200 }
            );
        }

        // 6. Parse dates from MT format "2024.01.15 10:30:00"
        const openTime = parseMTDateTime(data.open_time);
        const closeTime = parseMTDateTime(data.close_time);

        // 7. Calculate net P&L (profit + commission + swap)
        const netPnL = data.profit + data.commission + data.swap;

        // 7b. Calculate P&L percentage using account balance from MT
        // Capital at trade entry ≈ current balance - this trade's P&L
        let profitLossPercentage: string | undefined;
        if (data.account_balance && data.account_balance > 0) {
            const capitalAtEntry = data.account_balance - netPnL;
            if (capitalAtEntry > 0) {
                const pnlPct = (netPnL / capitalAtEntry) * 100;
                profitLossPercentage = pnlPct.toFixed(2);
            }
        }

        // 8. Find or create asset for this symbol
        const assetId = await getOrCreateAsset(
            db,
            data.symbol,
            connection.journalId,
            connection.userId
        );

        // 9. Determine trading session based on close time
        const sessionName = determineSessionFromTime(closeTime);
        const journalSessions = await db
            .select()
            .from(tradingSessions)
            .where(
                and(
                    eq(tradingSessions.journalId, connection.journalId),
                    eq(tradingSessions.name, sessionName)
                )
            )
            .limit(1);

        const sessionId = journalSessions[0]?.id || null;

        if (sessionId) {
        } else {
            console.warn(
                `[MT Webhook] Session "${sessionName}" not found for journal ${connection.journalId}`
            );
        }

        // 10. Calculate risk percentage from stop loss amount
        const journal = await db.query.tradingJournals.findFirst({
            where: eq(tradingJournals.id, connection.journalId),
            columns: {
                startingCapital: true,
            },
        });

        let riskPercentage: string | undefined;

        if (
            data.stop_loss_amount &&
            data.stop_loss_amount > 0 &&
            journal?.startingCapital
        ) {
            const startingCapital = Number(journal.startingCapital);
            if (startingCapital > 0) {
                const riskPct = (data.stop_loss_amount / startingCapital) * 100;
                riskPercentage = riskPct.toFixed(2);
            }
        }

        // 11. Determine exit reason based on P&L%
        // Thresholds: BE = -0.10% to +1%, TP = >+1%, SL = <-0.10%
        const BE_THRESHOLD_LOW = -0.1;
        const BE_THRESHOLD_HIGH = 1;
        const pnlPct = profitLossPercentage
            ? Number.parseFloat(profitLossPercentage)
            : 0;

        let exitReason: "TP" | "BE" | "SL" = "BE";
        if (pnlPct > BE_THRESHOLD_HIGH) {
            exitReason = "TP";
        } else if (pnlPct < BE_THRESHOLD_LOW) {
            exitReason = "SL";
        }

        // 12. Create the advanced trade
        const tradeId = nanoid();
        const [newTrade] = await db
            .insert(advancedTrades)
            .values({
                id: tradeId,
                userId: connection.userId,
                journalId: connection.journalId,
                assetId,
                sessionId,

                // Trade timing - use close time as the trade date
                tradeDate: closeTime,

                // Financial data
                profitLossAmount: String(netPnL),
                profitLossPercentage,
                exitReason,
                riskInput: riskPercentage,

                // Source tracking
                source: "metatrader",
                externalId: String(data.ticket),
                externalAccountId: String(data.account),
                syncStatus: "synced",
                lastSyncedAt: new Date(),

                // Sync metadata - store all the raw data from MT
                syncMetadata: JSON.stringify({
                    ticket: data.ticket,
                    positionId: data.position_id,
                    symbol: data.symbol,
                    type: data.type,
                    volume: data.volume,
                    openPrice: data.open_price,
                    closePrice: data.close_price,
                    stopLoss: data.stop_loss,
                    stopLossAmount: data.stop_loss_amount,
                    profit: data.profit,
                    commission: data.commission,
                    swap: data.swap,
                    comment: data.comment,
                    magic: data.magic,
                    openTime: openTime.toISOString(),
                    closeTime: closeTime.toISOString(),
                    broker: data.broker,
                    currency: data.currency,
                    platform: data.platform || "MT5",
                    accountBalance: data.account_balance,
                    accountEquity: data.account_equity,
                    accountType: data.account_type,
                }),

                // Mark as closed since we only receive closed trades
                isClosed: true,

                // Timestamps
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        // 13. Update broker connection stats
        const currentSyncCount = Number.parseInt(
            connection.syncCount || "0",
            10
        );
        const isDemo = data.account_type === "demo";

        await db
            .update(brokerConnections)
            .set({
                lastSyncedAt: new Date(),
                lastSyncStatus: "success",
                syncCount: String(currentSyncCount + 1),
                // Update broker info on first sync
                brokerName: connection.brokerName || data.broker,
                accountNumber: connection.accountNumber || String(data.account),
                currency: connection.currency || data.currency,
                platform: data.platform?.toLowerCase() || connection.platform,
                accountType: isDemo ? "demo" : "live",
                updatedAt: new Date(),
            })
            .where(eq(brokerConnections.id, connection.id));

        // 14. Update journal name and capital on first sync
        if (currentSyncCount === 0) {
            const platformName = data.platform || "MetaTrader";
            const journalName = isDemo
                ? `${platformName} Demo Account`
                : `${platformName} Live Account`;

            // Calculate approximate starting capital from current balance
            // Starting capital ≈ current balance - this trade's P&L (rough estimate for first trade)
            const estimatedStartingCapital = data.account_balance
                ? Math.round(data.account_balance - netPnL)
                : undefined;

            await db
                .update(tradingJournals)
                .set({
                    name: journalName,
                    // Update starting capital if we have balance info and current capital seems wrong
                    ...(estimatedStartingCapital &&
                    journal?.startingCapital &&
                    Math.abs(
                        Number(journal.startingCapital) -
                            estimatedStartingCapital
                    ) > 100
                        ? { startingCapital: String(estimatedStartingCapital) }
                        : {}),
                    updatedAt: new Date(),
                })
                .where(eq(tradingJournals.id, connection.journalId));
            if (estimatedStartingCapital) {
            }
        }

        const processingTime = Date.now() - startTime;

        return NextResponse.json(
            {
                success: true,
                message: "Trade recorded successfully",
                tradeId: newTrade.id,
                processingTimeMs: processingTime,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[MT Webhook] Error processing trade:", error);

        return NextResponse.json(
            {
                error: "Internal server error",
                code: "INTERNAL_ERROR",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

/**
 * Parse MetaTrader datetime format: "2024.01.15 10:30:00"
 * Note: MT sends dates in server timezone, we parse as-is
 */
function parseMTDateTime(mtDateTime: string): Date {
    // Format: "2024.01.15 10:30:00"
    const [datePart, timePart] = mtDateTime.split(" ");
    const [year, month, day] = datePart.split(".").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    // Create date (note: month is 0-indexed in JS)
    return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Health check endpoint
 * GET /api/integrations/metatrader/webhook
 */
export async function GET() {
    return NextResponse.json({
        status: "ok",
        service: "MetaTrader Webhook",
        timestamp: new Date().toISOString(),
    });
}
