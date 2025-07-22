import { initTRPC, TRPCError } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { ZodError } from "zod";
import { headers } from "next/headers";

import { db } from "@/server/db";
import { auth, type Session } from "@/lib/auth";

/**
 * 1. CONTEXT
 * Créer le contexte utilisé par les procédures tRPC
 */
interface CreateContextOptions {
  session: Session | null;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const session = await auth.api.getSession({
    headers: opts.req.headers,
  });

  return createInnerTRPCContext({
    session,
  });
};

export const createTRPCContextRSC = async () => {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

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
  if (!ctx.session || !ctx.session.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // Narrower le contexte - session est maintenant non-nullable
      session: { ...ctx.session, userId: ctx.session.user.id },
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