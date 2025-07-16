import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/server/db";

/**
 * 1. CONTEXT
 * Créer le contexte utilisé par les procédures tRPC
 */
interface CreateContextOptions {
  session: ReturnType<typeof getAuth> | null;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

export const createTRPCContext = async (opts: CreateNextContextOptions | { headers: Headers }) => {
  let auth: ReturnType<typeof getAuth> | null = null;
  
  if ('req' in opts) {
    // Pages Router
    auth = getAuth(opts.req);
  } else {
    // App Router - headers seulement
    // Pour App Router, l'auth sera géré côté client via Clerk
    auth = null;
  }
  
  const session = auth?.sessionId ? auth : null;

  return createInnerTRPCContext({
    session,
  });
};

/**
 * 2. INITIALIZATION
 * Initialiser tRPC avec les transformeurs et formatage d'erreurs
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. REUSABLE MIDDLEWARE
 * Middleware pour vérifier l'authentification
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // Narrower le contexte - session est maintenant non-nullable
      session: { ...ctx.session, userId: ctx.session.userId },
      db: ctx.db,
    },
  });
});

/**
 * 4. PROCEDURES
 * Export des procédures réutilisables
 */

// Procédure publique - accessible sans authentification
export const publicProcedure = t.procedure;

// Procédure protégée - nécessite une authentification
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

// Export du router factory
export const createTRPCRouter = t.router;

// Export du caller factory pour les Server Components
export const createCallerFactory = t.createCallerFactory; 