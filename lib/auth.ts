import { PROJECT } from "@/constants/project";
import ResetPasswordTemplate from "@/emails/reset-password";
import VerifyEmailTemplate from "@/emails/verify-email";
import { passkey } from "@better-auth/passkey";
import { stripe } from "@better-auth/stripe";
import { render } from "@react-email/components";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, lastLoginMethod } from "better-auth/plugins";
import Stripe from "stripe";

import { env } from "@/env";
import { resend } from "@/lib/resend";
import { db } from "@/server/db";

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

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY);

const userAdditionalFields = {
  rank: {
    type: [
      "NEW",
      "BEGINNER",
      "RISING",
      "CHAMPION",
      "EXPERT",
      "LEGEND",
      "MASTER",
      "GRANDMASTER",
      "IMMORTAL",
    ],
    required: true,
    defaultValue: "NEW",
  },
  isLeaderboardPublic: {
    type: "boolean" as const,
    required: true,
    defaultValue: false,
  },
  timezone: {
    type: "string" as const,
    required: true,
    defaultValue: "UTC",
  },
};

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
        }),
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
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      async onCustomerCreate({ stripeCustomer, user }, ctx) {
        // Check if user already has a subscription
        const existingSubscriptions = await ctx.context.adapter.findMany({
          model: "subscription",
          where: [
            {
              field: "referenceId",
              value: user.id,
            },
          ],
        });

        // Only create trial if user doesn't have any subscription
        if (existingSubscriptions.length === 0) {
          try {
            // Create a local trial subscription record
            // The Stripe subscription will be created when user upgrades through checkout
            const trialStart = new Date();
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 14);

            // Create subscription record in database with trialing status
            await ctx.context.adapter.create({
              model: "subscription",
              data: {
                plan: "pro",
                referenceId: user.id,
                stripeCustomerId: stripeCustomer.id,
                status: "trialing",
                trialStart,
                trialEnd,
                periodStart: trialStart,
                periodEnd: trialEnd,
              },
            });
          } catch (error) {
            ctx.context.logger.error(
              `Failed to create trial subscription for user ${user.id}:`,
              error,
            );
          }
        }
      },
      subscription: {
        enabled: true,
        plans: [
          {
            name: "pro",
            priceId: env.STRIPE_PRICE_ID,
          },
        ],
      },
    }),
    lastLoginMethod(),
    passkey({
      origin: getBaseUrl(),
      rpName: PROJECT.NAME,
      rpID: new URL(getBaseUrl()).hostname,
    }),
    admin({
      allowImpersonatingAdmins: true,
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp }, ctx) {
        const host = ctx?.request?.headers.get("host") ?? "localhost:3000";

        const html = await render(
          VerifyEmailTemplate({
            otp,
            host,
            email,
          }),
        );

        await resend.emails.send({
          from: "Altiora <noreply@altiora.pro>",
          to: email,
          subject: `Your verification code for ${PROJECT.NAME}`,
          html,
        });
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
