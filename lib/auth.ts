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

// Proxy pour déboguer et corriger les timestamps Better Auth
const dbProxy = new Proxy(db, {
  get(target, prop) {
    const original = (target as any)[prop];
    
    if (prop === 'insert') {
      return (table: any) => {
        const insertBuilder = original.call(target, table);
        return new Proxy(insertBuilder, {
          get(insertTarget, insertProp) {
            const insertOriginal = (insertTarget as any)[insertProp];
            if (insertProp === 'values') {
              return (values: any) => {
                console.log('[DB PROXY INSERT] Values before fix:', values);
                
                // Fix emailVerified boolean -> null
                if (values.emailVerified === false || values.emailVerified === true) {
                  console.log('[DB PROXY INSERT] Converting emailVerified boolean to null');
                  values.emailVerified = null;
                }
                
                // Fix timestamps manquants pour Better Auth
                const now = new Date();
                if (values.createdAt === undefined || values.createdAt === null) {
                  console.log('[DB PROXY INSERT] Adding missing createdAt');
                  values.createdAt = now;
                }
                if (values.updatedAt === undefined || values.updatedAt === null) {
                  console.log('[DB PROXY INSERT] Adding missing updatedAt');
                  values.updatedAt = now;
                }
                
                console.log('[DB PROXY INSERT] Values after fix:', values);
                return insertOriginal.call(insertTarget, values);
              };
            }
            return typeof insertOriginal === 'function' ? insertOriginal.bind(insertTarget) : insertOriginal;
          }
        });
      };
    }
    
    if (prop === 'update') {
      return (table: any) => {
        const updateBuilder = original.call(target, table);
        return new Proxy(updateBuilder, {
          get(updateTarget, updateProp) {
            const updateOriginal = (updateTarget as any)[updateProp];
            if (updateProp === 'set') {
              return (values: any) => {
                // Fix emailVerified boolean -> null ou Date
                if (values.emailVerified === false || values.emailVerified === true) {
                  values.emailVerified = null;
                }
                
                // Fix updatedAt manquant
                if (values.updatedAt === undefined || values.updatedAt === null) {
                  values.updatedAt = new Date();
                }
                
                return updateOriginal.call(updateTarget, values);
              };
            }
            return typeof updateOriginal === 'function' ? updateOriginal.bind(updateTarget) : updateOriginal;
          }
        });
      };
    }
    
    return typeof original === 'function' ? original.bind(target) : original;
  }
});

const baseAdapter = drizzleAdapter(dbProxy as any, {
  provider: "pg",
  schema: {
    user: users,
    session: sessions,
    account: accounts,
    verification: verifications,
  },
});

// Wrapper de l'adapter pour corriger les timestamps
const wrappedAdapter = (options: any) => {
  const adapter = baseAdapter(options);
  
  const originalCreate = adapter.create;
  adapter.create = async <T extends Record<string, unknown>, R = T>(
    data: { model: string; data: Omit<T, "id">; select?: string[] | undefined; forceAllowId?: boolean | undefined; }
  ): Promise<R> => {
    console.log(`[ADAPTER CREATE] Model: ${data.model}, Data:`, data.data);
    
    const payload = { ...data, data: { ...data.data } };
    
    // Fix timestamps pour TOUS les modèles
    const now = new Date();
    if ((payload.data as any).createdAt === undefined || (payload.data as any).createdAt === null) {
      console.log('[ADAPTER CREATE] Adding createdAt');
      (payload.data as any).createdAt = now;
    }
    if ((payload.data as any).updatedAt === undefined || (payload.data as any).updatedAt === null) {
      console.log('[ADAPTER CREATE] Adding updatedAt');
      (payload.data as any).updatedAt = now;
    }
    
    // Fix emailVerified
    if ((payload.data as any).emailVerified === false || (payload.data as any).emailVerified === true) {
      console.log('[ADAPTER CREATE] Converting emailVerified boolean to null');
      (payload.data as any).emailVerified = null;
    }
    
    console.log(`[ADAPTER CREATE] Final data:`, payload.data);
    return originalCreate.call(adapter, payload) as Promise<R>;
  };
  
  const originalUpdate = adapter.update;
  adapter.update = async <T extends Record<string, unknown>, R = T>(
    data: { model: string; where: any; update: Partial<T>; select?: string[] | undefined; }
  ): Promise<R> => {
    console.log(`[ADAPTER UPDATE] Model: ${data.model}, Update:`, data.update);
    
    const payload = { ...data, update: { ...data.update } };
    
    if ((payload.update as any).updatedAt === undefined || (payload.update as any).updatedAt === null) {
      console.log('[ADAPTER UPDATE] Adding updatedAt');
      (payload.update as any).updatedAt = new Date();
    }
    
    if ((payload.update as any).emailVerified === false || (payload.update as any).emailVerified === true) {
      console.log('[ADAPTER UPDATE] Converting emailVerified boolean to null');
      (payload.update as any).emailVerified = null;
    }
    
    console.log(`[ADAPTER UPDATE] Final update:`, payload.update);
    return originalUpdate.call(adapter, payload) as Promise<R>;
  };
  
  return adapter;
};

export const auth = betterAuth({
  baseURL: computedBaseUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  database: wrappedAdapter,
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
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
    }),
    
    after: createAuthMiddleware(async () => {
    }),
  },
  trustedOrigins: [computedBaseUrl],
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
  },

  emailVerification: {
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

  ...(process.env.NODE_ENV === "development" && {
    debug: true,
  }),

  session: {
    expiresIn: 60 * 60 * 24 * 7, 
    updateAge: 60 * 60 * 24, 
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user; 