import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import { users, sessions, accounts, verifications } from "@/server/db/schema";
import { Resend } from "resend";
import { createAuthMiddleware } from "better-auth/api";


const resend = new Resend(process.env.RESEND_API_KEY);



const computedBaseUrl = (() => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return "http://localhost:3000";
})();

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
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      console.log("🔍 Hook before - Path:", ctx.path);
      console.log("🔍 Hook before - Body:", ctx.body);
      
      if (ctx.path === "/sign-up/email") {
        console.log("📝 Modifying sign-up request");
        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              name: ctx.body.name || "John Doe",
            },
          }
        };
      }
      
      if (ctx.path === "/sign-in/social") {
        console.log("🔐 Social sign-in detected");
        console.log("🔐 Provider:", ctx.query?.provider);
        console.log("🔐 Body:", ctx.body);
        
        // Vérifier si un state va être créé
        if (ctx.body?.provider === 'google') {
          console.log("🔐 Google OAuth initiation");
        }
      }
      
      if (ctx.path === "/callback/:id") {
        console.log("🔄 OAuth callback detected");
        console.log("🔄 Query params:", ctx.query);
        
      // Intercepter la création d'utilisateur pour corriger les dates
      try {
        const adapter = ctx.context.adapter;
        if (adapter && adapter.create) {
          const originalCreate = adapter.create;
          adapter.create = async <T extends Record<string, unknown>, R = T>(data: { model: string; data: Omit<T, "id">; select?: string[] | undefined; forceAllowId?: boolean | undefined; }): Promise<R> => {
            const payload = structuredClone(data);

            if (payload.model === "user") {
              if ((payload.data as any).emailVerified && (payload.data as any).emailVerified !== "UNVERIFIED") {
                (payload.data as any).emailVerified =
                  (payload.data as any).emailVerified instanceof Date
                    ? (payload.data as any).emailVerified
                    : new Date();
              } else {
                (payload.data as any).emailVerified = null;
              }
            }

            return originalCreate.call(adapter, payload);
          };
        }
      } catch (error) {
        console.error("❌ Error intercepting adapter:", error);
      }
      }
    }),
    
    after: createAuthMiddleware(async (ctx) => {
      console.log("✅ Hook after - Path:", ctx.path);
      
      if (ctx.path.startsWith("/sign-up")) {
        console.log("🎉 New user registered!");
        if (ctx.context.newSession) {
          console.log("👤 New session created:", ctx.context.newSession.user);
        }
      }
      
      if (ctx.path.startsWith("/sign-in")) {
        console.log("🔑 User signed in!");
        if (ctx.context.newSession) {
          console.log("👤 Session details:", ctx.context.newSession.user);
        }
      }
    }),
  },
  trustedOrigins: [computedBaseUrl],
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
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${computedBaseUrl}/api/auth/callback/google`,
      allowDangerousEmailAccountLinking: true,
    },
  },
  
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    database: {
      generateId: false,
    },
  },

  
  onError: (error: Error, request?: Request) => {
    console.error("Better Auth Error - DETAILED:", {
      error: error.message || error,
      code: (error as Error & { code?: string }).code,
      stack: error.stack,
      url: request?.url,
      method: request?.method,
      headers: request?.headers ? Object.fromEntries(request.headers.entries()) : {},
      timestamp: new Date().toISOString(),
      errorType: error.constructor.name,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
    });
  },

  ...(process.env.NODE_ENV === "development" && {
    debug: true,
  }),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user; 