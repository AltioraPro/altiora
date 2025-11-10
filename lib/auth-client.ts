"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";
import { whitelistClient } from "./auth/plugins/whitelist/client";

function resolveBaseUrl(): string {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    return "http://localhost:3000";
}

export const authClient = createAuthClient({
    baseURL: resolveBaseUrl(),
    plugins: [inferAdditionalFields<typeof auth>(), whitelistClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
