import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { headers } from "next/headers";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth, type Session } from "@/lib/auth";
import { db } from "@/server/db";

interface CreateContextOptions {
    session: Session | null;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => ({
    session: opts.session,
    db,
});

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

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof ZodError
                        ? error.cause.flatten()
                        : null,
            },
        };
    },
});

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
        ctx: {
            session: { ...ctx.session, userId: ctx.session.user.id },
            db: ctx.db,
        },
    });
});

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

export const createTRPCRouter = t.router;

export const createCallerFactory = t.createCallerFactory;
