import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import { users, sessions, accounts, verifications } from "@/server/db/schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const computedBaseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const auth = betterAuth({
  baseURL: computedBaseUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  cookies: {
    sessionToken: {
      name: "better-auth.session_token",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: { email: string }, url: string }) => {
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
    sendVerificationEmail: async ({ user, url }: { user: { email: string }, url: string }) => {
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
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user; 