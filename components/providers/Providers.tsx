"use client";

import { AutumnProvider } from "autumn-js/react";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { env } from "@/env";
import { TRPCReactProvider } from "@/trpc/client";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <AutumnProvider betterAuthUrl={env.NEXT_PUBLIC_BETTER_AUTH_URL}>
            <TRPCReactProvider>
                <ToastProvider>{children}</ToastProvider>
            </TRPCReactProvider>
        </AutumnProvider>
    );
}
