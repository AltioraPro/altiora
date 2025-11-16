import { os } from "@orpc/server";
import z from "zod";
import type { UserRole } from "@/constants/roles";
import type { Session } from "@/lib/auth";
import type { Database } from "@/server/db";

interface Meta {
    roles?: UserRole[];
}

export const base = os
    .$context<{
        headers: Headers;
        db: Database;
        session?: Session | null;
        userRole?: UserRole;
    }>()
    .errors({
        RATE_LIMIT_EXCEEDED: {
            status: 429,
            data: z.object({
                retryAfterSeconds: z
                    .number()
                    .describe("The number of seconds to wait before retrying."),
                totalRequests: z
                    .number()
                    .describe("The total number of requests made."),
                remainingRequests: z
                    .number()
                    .describe("The number of requests remaining."),
            }),
        },
        UNAUTHORIZED: {
            status: 401,
        },
        FORBIDDEN: {
            status: 403,
        },
    })
    .$meta<Meta>({ roles: undefined });
