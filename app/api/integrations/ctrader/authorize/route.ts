import { z } from "zod";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { db } from "@/server/db";
import { account, session as sessionTable, oauthStates } from "@/server/db/schema";
import { EncryptionService } from "@/server/services/encryption.service";
import { auth } from "@/lib/auth";

/**
 * cTrader OAuth Authorization Endpoint
 * Redirects user to cTrader for OAuth authorization
 */
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const journalId = searchParams.get("journalId");

		if (!journalId) {
			return NextResponse.json(
				{ error: "Missing journalId parameter" },
				{ status: 400 },
			);
		}

		if (!env.CTRADER_CLIENT_ID) {
			return NextResponse.json(
				{ error: "cTrader OAuth not configured" },
				{ status: 500 },
			);
		}


		// Generate state for CSRF protection
		const state = nanoid();

		// Get current session
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		// Store state in database (more reliable than cookies for OAuth)
		await db.insert(oauthStates).values({
			state,
			provider: "ctrader",
			userId: session.user.id,
			journalId,
			expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
		});

		// Redirect to cTrader OAuth
		const authUrl = createAuthorizationURL(state, journalId);
		return NextResponse.redirect(authUrl, 307);
	} catch (error) {
		console.error("cTrader OAuth authorize error:", error);
		return NextResponse.json(
			{ error: "OAuth authorization failed" },
			{ status: 500 },
		);
	}
}

function createAuthorizationURL(state: string, journalId: string): string {
	const baseUrl =
		process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
	const redirectUri = `${baseUrl}/api/integrations/ctrader/callback`;

	const params = new URLSearchParams({
		client_id: env.CTRADER_CLIENT_ID!,
		redirect_uri: redirectUri,
		response_type: "code",
		scope: "trading", // Changed back to trading
		state,
	});

	// CORRECT cTrader OAuth endpoint
	return `https://connect.spotware.com/apps/auth?${params.toString()}`;
}
