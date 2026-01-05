import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db";
import { brokerConnections, advancedTrades, tradingSessions, tradingJournals } from "@/server/db/schema";
import { metatraderWebhookPayloadSchema } from "@/server/routers/integrations/metatrader/validators";
import { getOrCreateAsset } from "@/server/routers/integrations/metatrader/utils";
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
	
	console.log("[MT Webhook] Incoming request from:", request.headers.get("user-agent"));
	
	try {
		// 1. Get token from header
		const token = request.headers.get("x-user-token");
		
		if (!token) {
			console.warn("[MT Webhook] Missing x-user-token header");
			return NextResponse.json(
				{ error: "Missing authentication token", code: "MISSING_TOKEN" },
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

		const validationResult = metatraderWebhookPayloadSchema.safeParse(payload);
		
		if (!validationResult.success) {
			console.warn("[MT Webhook] Validation failed:", validationResult.error.issues);
			return NextResponse.json(
				{ 
					error: "Invalid payload format", 
					code: "VALIDATION_ERROR",
					details: validationResult.error.issues 
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
			console.warn("[MT Webhook] Invalid or inactive token:", token.substring(0, 10) + "...");
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
			console.log("[MT Webhook] Duplicate trade ignored:", data.ticket);
			return NextResponse.json(
				{ 
					success: true, 
					message: "Trade already exists",
					tradeId: existingTrade.id,
					duplicate: true 
				},
				{ status: 200 }
			);
		}

		// 6. Parse dates from MT format "2024.01.15 10:30:00"
		const openTime = parseMTDateTime(data.open_time);
		const closeTime = parseMTDateTime(data.close_time);

		// 7. Calculate net P&L (profit + commission + swap)
		const netPnL = data.profit + data.commission + data.swap;

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
			console.log(`[MT Webhook] Trade assigned to session: ${sessionName}`);
		} else {
			console.warn(`[MT Webhook] Session "${sessionName}" not found for journal ${connection.journalId}`);
		}

		// 10. Calculate risk percentage from stop loss amount
		const journal = await db.query.tradingJournals.findFirst({
			where: eq(tradingJournals.id, connection.journalId),
			columns: {
				startingCapital: true,
			},
		});

		let riskPercentage: string | undefined = undefined;
		
		if (data.stop_loss_amount && data.stop_loss_amount > 0 && journal?.startingCapital) {
			const startingCapital = Number(journal.startingCapital);
			if (startingCapital > 0) {
				const riskPct = (data.stop_loss_amount / startingCapital) * 100;
				riskPercentage = riskPct.toFixed(2);
				console.log(`[MT Webhook] Calculated risk: ${riskPercentage}% (SL: ${data.stop_loss_amount}€ / Capital: ${startingCapital}€)`);
			}
		}

		// 11. Create the advanced trade
		const tradeId = nanoid();
		const [newTrade] = await db
			.insert(advancedTrades)
			.values({
				id: tradeId,
				userId: connection.userId,
				journalId: connection.journalId,
				assetId: assetId,
				sessionId: sessionId,
				
				// Trade timing - use close time as the trade date
				tradeDate: closeTime,
				
				// Financial data
				profitLossAmount: String(netPnL),
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
				}),
				
				// Mark as closed since we only receive closed trades
				isClosed: true,
				
				// Timestamps
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		// 12. Update broker connection stats
		const currentSyncCount = parseInt(connection.syncCount || "0", 10);
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
				updatedAt: new Date(),
			})
			.where(eq(brokerConnections.id, connection.id));

		const processingTime = Date.now() - startTime;
		console.log(`[MT Webhook] Trade ${data.ticket} saved in ${processingTime}ms`);

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
				message: error instanceof Error ? error.message : "Unknown error"
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
