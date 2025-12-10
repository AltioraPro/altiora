"use client";

import { passkeyClient } from "@better-auth/passkey/client";
import {
    adminClient,
    emailOTPClient,
    inferAdditionalFields,
    lastLoginMethodClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

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
    plugins: [
        emailOTPClient(),
        adminClient(),
        lastLoginMethodClient(),
        passkeyClient(),
        inferAdditionalFields<typeof auth>(),
    ],
});
