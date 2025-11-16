import type { UserRole } from "@/constants/roles";
import { getServerSession } from "@/lib/auth/utils";

import { base } from "../context";

export const authMiddleware = base.middleware(async (opts) => {
    const { next, procedure, errors, context } = opts;

    const session = context.session ?? (await getServerSession());

    if (!session) {
        throw errors.UNAUTHORIZED();
    }

    if (!procedure["~orpc"].meta.roles) {
        return next({ context: { ...context, session } });
    }

    const requiredRoles = procedure["~orpc"].meta.roles;
    const userRole = session.user?.role as UserRole;

    if (requiredRoles && requiredRoles.length > 0) {
        if (!userRole) {
            throw errors.UNAUTHORIZED();
        }
        if (!requiredRoles.includes(userRole)) {
            throw errors.FORBIDDEN();
        }
    }

    return next({
        context: {
            ...context,
            session,
            userRole,
        },
    });
});
