import "server-only";

import { createRouterClient } from "@orpc/server";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/auth/utils";
import { db } from "@/server/db";
import { appRouter } from "@/server/routers/_app";

globalThis.$client = createRouterClient(appRouter, {
    /**
     * Provide initial context if needed.
     *
     * Because this client instance is shared across all requests,
     * only include context that's safe to reuse globally.
     * For per-request context, use middleware context or pass a function as the initial context.
     */
    context: async () => ({
        headers: await headers(),
        db,
    }),
});

export const api = createRouterClient(appRouter, {
    context: async () => ({
        headers: await headers(),
        db,
        session: await getServerSession(),
    }),
});
