"use client";

import { AutumnProvider } from "autumn-js/react";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { env } from "@/env";
import { ORPCQueryClientProvider } from "@/providers/query-client.provider";
import { ThemeProvider } from "@/providers/theme-provider";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ORPCQueryClientProvider>
            <ThemeProvider attribute="class" forcedTheme="dark">
                <AutumnProvider
                    betterAuthUrl={env.NEXT_PUBLIC_BETTER_AUTH_URL}
                    includeCredentials={true}
                >
                    <ToastProvider>{children}</ToastProvider>
                </AutumnProvider>
            </ThemeProvider>
        </ORPCQueryClientProvider>
    );
}
