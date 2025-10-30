import { stripe } from "@better-auth/stripe";
import { autumn } from "autumn-js/better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@/env";
import { resend } from "@/lib/resend";
import { db } from "@/server/db";
import stripeClient from "./stripe";

export function getBaseUrl() {
    if (env.VERCEL_ENV === "preview") {
        return `https://${env.VERCEL_BRANCH_URL}`;
    }
    if (env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    return "http://localhost:3000";
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
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [getBaseUrl()],
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    user: {
        additionalFields: userAdditionalFields,
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({
            user,
            url,
        }: {
            user: { email: string };
            url: string;
        }) => {
            await resend.emails.send({
                from: "Altiora <noreply@altiora.pro>",
                to: user.email,
                subject: "Reset your password - Altiora",
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #fff; font-size: 32px; margin: 0;">ALTIORA</h1>
              <p style="color: #999; margin: 8px 0 0 0;">Personal coaching platform</p>
            </div>
            
            <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
              <h2 style="color: #fff; margin: 0 0 16px 0; font-size: 24px;">Reset Your Password</h2>
              <p style="color: #ccc; margin: 0 0 24px 0; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${url}" style="background: #fff; color: #000; padding: 16px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin: 24px 0 0 0; text-align: center;">
                This link will expire in 1 hour.
              </p>
              
              <p style="color: #666; font-size: 14px; margin: 16px 0 0 0; text-align: center;">
                If you didn't request this password reset, please ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">© 2024 Altiora. All rights reserved.</p>
            </div>
          </div>
        `,
            });
        },
    },

    emailVerification: {
        sendVerificationEmail: async ({
            user,
            url,
        }: {
            user: { email: string };
            url: string;
        }) => {
            await resend.emails.send({
                from: "Altiora <noreply@altiora.pro>",
                to: user.email,
                subject: "Verify your email address",
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #fff; font-size: 32px; margin: 0;">ALTIORA</h1>
              <p style="color: #999; margin: 8px 0 0 0;">Personal coaching platform</p>
            </div>
            
            <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
              <h2 style="color: #fff; margin: 0 0 16px 0; font-size: 24px;">Welcome to Altiora!</h2>
              <p style="color: #ccc; margin: 0 0 24px 0; line-height: 1.6;">
                Complete your account setup by verifying your email address. Click the button below to get started.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${url}" style="background: #fff; color: #000; padding: 16px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin: 24px 0 0 0; text-align: center;">
                This link will expire in 24 hours.
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">If you didn't create this account, please ignore this email.</p>
              <p style="margin: 8px 0 0 0;">© 2024 Altiora. All rights reserved.</p>
            </div>
          </div>
        `,
            });
        },
    },

    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },

    advanced: {
        crossSubDomainCookies: {
            enabled: true,
        },
        useSecureCookies: env.NODE_ENV === "production",
    },

    ...(process.env.NODE_ENV === "development" && {
        debug: true,
    }),

    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },

    plugins: [
        stripe({
            stripeClient,
            stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
            createCustomerOnSignUp: true,
            subscription: {
                getCheckoutSessionParams: () => ({
                    params: {
                        tax_id_collection: {
                            enabled: true,
                        },
                    },
                }),
                enabled: true,
                plans: [
                    {
                        name: "altioran",
                        priceId: "price_1SCdcHBtAefV566E4tUitB8Z",
                    },
                ],
            },
        }),
        autumn(),
    ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
