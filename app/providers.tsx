"use client";

import { AutumnProvider } from "autumn-js/react";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { env } from "@/env";
import { ORPCQueryClientProvider } from "@/providers/query-client.provider";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ORPCQueryClientProvider>
            <AutumnProvider betterAuthUrl={env.NEXT_PUBLIC_BETTER_AUTH_URL}>
                <ToastProvider>{children}</ToastProvider>
            </AutumnProvider>
        </ORPCQueryClientProvider>
    );
}
