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
import {
    type MetaTraderWebhookPayload,
    metatraderWebhookPayloadSchema,
} from "@/server/routers/integrations/metatrader/validators";
import { determineSessionFromTime } from "@/server/routers/trading/utils/auto-sessions";

/**
 * MetaTrader Webhook Endpoint
 *
 * Receives trade data from MT4/MT5 Expert Advisors
 * Authentication is done via the x-user-token header
 *
 * POST /api/integrations/metatrader/webhook
 */

async function validateMTAuth(request: NextRequest, dataToken: string) {
    const token = request.headers.get("x-user-token");
    if (!token) {
        return {
            error: "Missing authentication token",
            code: "MISSING_TOKEN",
            status: 401,
        };
    }
    if (token !== dataToken) {
        return { error: "Token mismatch", code: "TOKEN_MISMATCH", status: 401 };
    }
    return { token };
}

async function getMTConnection(token: string) {
    const connection = await db.query.brokerConnections.findFirst({
        where: and(
            eq(brokerConnections.webhookToken, token),
            eq(brokerConnections.provider, "metatrader"),
            eq(brokerConnections.isActive, true)
        ),
    });
    if (!connection) {
        return {
            error: "Invalid or inactive token",
            code: "INVALID_TOKEN",
            status: 401,
        };
    }
    return { connection };
}

function calcMTFinancials(
    data: MetaTraderWebhookPayload,
    netPnL: number,
    journalCapital?: string | null
) {
    let profitLossPercentage: string | undefined;
    if (data.account_balance && data.account_balance > 0) {
        const capitalAtEntry = data.account_balance - netPnL;
        if (capitalAtEntry > 0) {
            profitLossPercentage = ((netPnL / capitalAtEntry) * 100).toFixed(2);
        }
    }

    let riskPercentage: string | undefined;
    if (data.stop_loss_amount && data.stop_loss_amount > 0 && journalCapital) {
        const startingCapital = Number(journalCapital);
        if (startingCapital > 0) {
            riskPercentage = (
                (data.stop_loss_amount / startingCapital) *
                100
            ).toFixed(2);
        }
    }

    const pnlPct = profitLossPercentage
        ? Number.parseFloat(profitLossPercentage)
        : 0;
    const exitReason = pnlPct > 1 ? "TP" : pnlPct < -0.1 ? "SL" : "BE";

    return { profitLossPercentage, riskPercentage, exitReason };
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        let payload: unknown;
        try {
            payload = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON payload", code: "INVALID_JSON" },
                { status: 400 }
            );
        }

        const validationResult =
            metatraderWebhookPayloadSchema.safeParse(payload);
        if (!validationResult.success) {
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
        const authResult = await validateMTAuth(request, data.token);
        if ("error" in authResult) {
            return NextResponse.json(
                { error: authResult.error, code: authResult.code },
                { status: authResult.status }
            );
        }

        const connResult = await getMTConnection(authResult.token);
        if ("error" in connResult) {
            return NextResponse.json(
                { error: connResult.error, code: connResult.code },
                { status: connResult.status }
            );
        }
        const { connection } = connResult;

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

        const openTime = parseMTDateTime(data.open_time);
        const closeTime = parseMTDateTime(data.close_time);
        const netPnL = data.profit + data.commission + data.swap;

        const journal = await db.query.tradingJournals.findFirst({
            where: eq(tradingJournals.id, connection.journalId),
            columns: { startingCapital: true },
        });

        const { profitLossPercentage, riskPercentage, exitReason } =
            calcMTFinancials(data, netPnL, journal?.startingCapital);

        const assetId = await getOrCreateAsset(
            db,
            data.symbol,
            connection.journalId,
            connection.userId
        );
        const sessionName = determineSessionFromTime(closeTime);
        const [session] = await db
            .select()
            .from(tradingSessions)
            .where(
                and(
                    eq(tradingSessions.journalId, connection.journalId),
                    eq(tradingSessions.name, sessionName)
                )
            )
            .limit(1);

        const tradeId = nanoid();
        const [newTrade] = await db
            .insert(advancedTrades)
            .values({
                id: tradeId,
                userId: connection.userId,
                journalId: connection.journalId,
                assetId,
                sessionId: session?.id || null,
                tradeDate: closeTime,
                profitLossAmount: String(netPnL),
                profitLossPercentage,
                exitReason,
                riskInput: riskPercentage,
                source: "metatrader",
                externalId: String(data.ticket),
                externalAccountId: String(data.account),
                syncStatus: "synced",
                lastSyncedAt: new Date(),
                syncMetadata: JSON.stringify({
                    ...data,
                    openTime: openTime.toISOString(),
                    closeTime: closeTime.toISOString(),
                }),
                isClosed: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        const currentSyncCount = Number.parseInt(
            connection.syncCount || "0",
            10
        );
        await db
            .update(brokerConnections)
            .set({
                lastSyncedAt: new Date(),
                lastSyncStatus: "success",
                syncCount: String(currentSyncCount + 1),
                brokerName: connection.brokerName || data.broker,
                accountNumber: connection.accountNumber || String(data.account),
                currency: connection.currency || data.currency,
                platform: data.platform?.toLowerCase() || connection.platform,
                accountType: data.account_type === "demo" ? "demo" : "live",
                updatedAt: new Date(),
            })
            .where(eq(brokerConnections.id, connection.id));

        if (currentSyncCount === 0) {
            const isDemo = data.account_type === "demo";
            const journalName = isDemo
                ? `${data.platform || "MetaTrader"} Demo Account`
                : `${data.platform || "MetaTrader"} Live Account`;
            const estStartingCap = data.account_balance
                ? Math.round(data.account_balance - netPnL)
                : undefined;

            await db
                .update(tradingJournals)
                .set({
                    name: journalName,
                    ...(estStartingCap &&
                    journal?.startingCapital &&
                    Math.abs(Number(journal.startingCapital) - estStartingCap) >
                        100
                        ? { startingCapital: String(estStartingCap) }
                        : {}),
                    updatedAt: new Date(),
                })
                .where(eq(tradingJournals.id, connection.journalId));
        }

        return NextResponse.json(
            {
                success: true,
                message: "Trade recorded successfully",
                tradeId: newTrade.id,
                processingTimeMs: Date.now() - startTime,
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
    const [datePart, timePart] = mtDateTime.split(" ");
    const [year, month, day] = datePart.split(".").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
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
