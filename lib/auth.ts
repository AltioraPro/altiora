import { render } from "@react-email/components";
import { autumn } from "autumn-js/better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { PAGES } from "@/constants/pages";
import { PROJECT } from "@/constants/project";
import ResetPasswordTemplate from "@/emails/reset-password";
import VerifyEmailTemplate from "@/emails/verify-email";
import WaitlistApprovedTemplate from "@/emails/waitlist-approved";
import { env } from "@/env";
import { resend } from "@/lib/resend";
import { db } from "@/server/db";
import { whitelist } from "./auth/plugins/whitelist";

const WWW_PREFIX_REGEX = /^www\./;

export function getBaseUrl() {
    if (env.VERCEL_ENV === "preview") {
        return `https://${env.VERCEL_BRANCH_URL}`;
    }
    if (env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    return "http://localhost:3000";
}

function getTrustedOrigins(): string[] {
    const baseUrl = getBaseUrl();

    // In production, include both www and non-www versions to handle CORS
    if (env.VERCEL_ENV === "production" || env.NODE_ENV === "production") {
        try {
            const url = new URL(baseUrl);
            const hostname = url.hostname;

            // If it's already www, return both versions
            if (hostname.startsWith("www.")) {
                const nonWww = hostname.replace(WWW_PREFIX_REGEX, "");
                return [baseUrl, `https://${nonWww}`];
            }

            // If it's non-www, return both versions
            return [baseUrl, `https://www.${hostname}`];
        } catch {
            // If URL parsing fails, just return the base URL
            return [baseUrl];
        }
    }

    return [baseUrl];
}

const userAdditionalFields = {
    rank: {
        type: "string",
        required: true,
        defaultValue: "NEW",
    },
    isLeaderboardPublic: {
        type: "boolean",
        required: true,
        defaultValue: false,
    },
} as const;

export const auth = betterAuth({
    baseURL: getBaseUrl(),
    trustedOrigins: getTrustedOrigins(),
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    user: {
        additionalFields: userAdditionalFields,
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        sendResetPassword: async ({ user, url }, request) => {
            const host = request?.headers.get("host") ?? "localhost:3000";

            const html = await render(
                ResetPasswordTemplate({
                    name: user.name,
                    url,
                    host,
                })
            );

            await resend.emails.send({
                from: "Altiora <noreply@altiora.pro>",
                to: user.email,
                subject: `Reset your password for ${PROJECT.NAME}`,
                html,
            });
        },
    },

    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
        discord: {
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
            scope: ["identify", "guilds.join"],
            disableImplicitSignUp: true,
            refreshAccessToken: refreshDiscordAccessToken,
        },
    },

    plugins: [
        autumn(),
        passkey({
            origin: getBaseUrl(),
            rpName: PROJECT.NAME,
            rpID: new URL(getBaseUrl()).hostname,
        }),
        admin(),
        emailOTP({
            async sendVerificationOTP({ email, otp }, request) {
                const host = request?.headers.get("host") ?? "localhost:3000";

                const html = await render(
                    VerifyEmailTemplate({
                        otp,
                        host,
                        email,
                    })
                );

                await resend.emails.send({
                    from: "Altiora <noreply@altiora.pro>",
                    to: email,
                    subject: `Your verification code for ${PROJECT.NAME}`,
                    html,
                });
            },
        }),
        whitelist({
            enforceOnRegistration: false,
            allowAdminManagement: true,
            allowWaitlist: true,
            sendStatusNotification: async ({ email, status, oldStatus }) => {
                if (oldStatus !== "pending") {
                    return;
                }

                switch (status) {
                    case "approved": {
                        const signUpUrl = `${getBaseUrl()}${PAGES.SIGN_UP}?signUpEmail=${email}`;
                        const html = await render(
                            WaitlistApprovedTemplate({
                                signUpUrl,
                                email,
                            })
                        );

                        await resend.emails.send({
                            from: "Altiora <noreply@altiora.pro>",
                            to: email,
                            subject: `Your application to ${PROJECT.NAME} has been approved`,
                            html,
                        });
                        break;
                    }
                    default: {
                        break;
                    }
                }
            },
        }),
    ],

    account: {
        accountLinking: {
            enabled: true,
        },
    },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

interface DiscordRefreshResponse {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
}

async function refreshDiscordAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresAt?: Date;
}> {
    const body = new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
    });

    const response = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    if (!response.ok) {
        throw new Error("Failed to refresh Discord access token");
    }

    const data = (await response.json()) as DiscordRefreshResponse;

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? refreshToken,
        accessTokenExpiresAt: data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000)
            : undefined,
    };
}
