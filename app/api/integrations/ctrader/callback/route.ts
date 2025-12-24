import { z } from "zod";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, and, gt } from "drizzle-orm";
import { env } from "@/env";
import { db } from "@/server/db";
import { account, oauthStates, brokerConnections } from "@/server/db/schema";
import { EncryptionService } from "@/server/services/encryption.service";
import { auth } from "@/lib/auth";

interface TokenResponse {
	access_token: string;
	refresh_token?: string;
	expires_in: number;
	token_type: string;
}

/**
 * cTrader OAuth Callback Endpoint
 * Handles OAuth callback from cTrader and stores encrypted tokens
 */
export async function GET(request: NextRequest) {
	try {
		const baseUrl =
			process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

		const searchParams = request.nextUrl.searchParams;
		const code = searchParams.get("code");
		const state = searchParams.get("state");
		const error = searchParams.get("error");

		console.log("[CALLBACK EARLY] Received params - code:", code ? "EXISTS" : "MISSING", "state:", state ? "EXISTS" : "MISSING");
		console.log("[CALLBACK EARLY] Full URL:", request.nextUrl.toString());

		// Check for OAuth errors
		if (error) {
			return NextResponse.redirect(
				new URL(`/trading/journals?error=ctrader_${error}`, baseUrl),
			);
		}

		if (!code) {
			console.error("[CALLBACK EARLY] Missing code!");
			return NextResponse.redirect(
				new URL("/trading/journals?error=missing_code", baseUrl),
			);
		}

		// Get current session BEFORE checking state
		// (cTrader doesn't return state in callback, so we need to find it by user)
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.redirect(
				new URL("/sign-in?callbackUrl=/trading/journals", baseUrl),
			);
		}

		// Get current session (already done above, remove duplicate)
		
		// Verify CSRF state from database
		// NOTE: cTrader OAuth doesn't return the state parameter in the callback
		// So we find the most recent non-expired state for this user
		console.log("[CALLBACK DEBUG] Looking for most recent state for user:", session.user.id);
		
		// Import desc for ordering
		const { desc } = await import("drizzle-orm");
		
		const savedState = await db.query.oauthStates.findFirst({
			where: and(
				eq(oauthStates.provider, "ctrader"),
				eq(oauthStates.userId, session.user.id),
				gt(oauthStates.expiresAt, new Date()), // Not expired
			),
			orderBy: [desc(oauthStates.createdAt)], // Most recent first
		});

		console.log("[CALLBACK DEBUG] Found state:", savedState);

		if (!savedState) {
			console.error("[CALLBACK DEBUG] No valid state found in database!");
			return NextResponse.redirect(
				new URL("/trading/journals?error=invalid_state", baseUrl),
			);
		}

		console.log("[CALLBACK DEBUG] State found! JournalId:", savedState.journalId);

		const journalId = savedState.journalId;
		if (!journalId) {
			return NextResponse.redirect(
				new URL("/trading/journals?error=missing_journal", baseUrl),
			);
		}

		// Delete used state
		await db.delete(oauthStates).where(eq(oauthStates.id, savedState.id));
		console.log("[CALLBACK DEBUG] State deleted, proceeding with OAuth...");

		// Exchange code for token
		const tokens = await exchangeCodeForToken(code);

		// Encrypt tokens
		const encryptedAccessToken = EncryptionService.encrypt(tokens.access_token);
		const encryptedRefreshToken = tokens.refresh_token
			? EncryptionService.encrypt(tokens.refresh_token)
			: null;

		// Check if account already exists
		const existingAccount = await db.query.account.findFirst({
			where: and(
				eq(account.userId, session.user.id),
				eq(account.providerId, "ctrader"),
			),
		});

		let accountId: string;

		if (existingAccount) {
			// Update existing account
			await db
				.update(account)
				.set({
					accessToken: encryptedAccessToken,
					refreshToken: encryptedRefreshToken,
					expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
				})
				.where(eq(account.id, existingAccount.id));
			accountId = existingAccount.id;
		} else {
			// Create new account
			const newAccountId = nanoid();
			await db.insert(account).values({
				id: newAccountId,
				userId: session.user.id,
				accountId: nanoid(), 
				providerId: "ctrader",
				accessToken: encryptedAccessToken,
				refreshToken: encryptedRefreshToken,
				expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
				createdAt: new Date(),
			});
			accountId = newAccountId;
		}

		// Check if connection already exists
		const existingConnection = await db.query.brokerConnections.findFirst({
			where: and(
				eq(brokerConnections.userId, session.user.id),
				eq(brokerConnections.journalId, journalId),
				eq(brokerConnections.provider, "ctrader"),
			),
		});

		if (!existingConnection) {
			await db.insert(brokerConnections).values({
				id: nanoid(),
				userId: session.user.id,
				journalId,
				provider: "ctrader",
				brokerAccountId: accountId, // Link to the OAuth account
				accountType: "live", // Default to live
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}

		// Clear cookies and redirect
		const response = NextResponse.redirect(
			new URL(`/trading/journals/${journalId}?success=ctrader_connected`, baseUrl),
		);
		response.cookies.delete("ctrader_oauth_state");
		response.cookies.delete("ctrader_oauth_journal");

		return response;
	} catch (error) {
		console.error("cTrader OAuth callback error:", error);
		const baseUrl =
			process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
		return NextResponse.redirect(
			new URL("/trading/journals?error=oauth_failed", baseUrl),
		);
	}
}

async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
	const baseUrl =
		process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
	const redirectUri = `${baseUrl}/api/integrations/ctrader/callback`;

	const body = new URLSearchParams({
		grant_type: "authorization_code",
		code,
		client_id: env.CTRADER_CLIENT_ID!,
		client_secret: env.CTRADER_CLIENT_SECRET!,
		redirect_uri: redirectUri,
	});

	// CORRECT cTrader OAuth token endpoint
	const response = await fetch("https://connect.spotware.com/oauth/v2/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: body.toString(),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Token exchange failed: ${error}`);
	}

	return await response.json();
}
