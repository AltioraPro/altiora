import { getServerSession } from "@/lib/auth/utils";

import { base } from "../context";

export const authMiddleware = base.middleware(async (opts) => {
    const { next, errors, context } = opts;

    const session = context.session ?? (await getServerSession());

    if (!session) {
        throw errors.UNAUTHORIZED();
    }

    return next({
        context: {
            ...context,
            session,
        },
    });
});
