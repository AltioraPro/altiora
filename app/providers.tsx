import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { ORPCQueryClientProvider } from "@/providers/query-client.provider";
import { ThemeProvider } from "@/providers/theme-provider";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ORPCQueryClientProvider>
            <ThemeProvider attribute="class" forcedTheme="dark">
                <NuqsAdapter>
                    <ToastProvider>{children}</ToastProvider>
                </NuqsAdapter>
            </ThemeProvider>
        </ORPCQueryClientProvider>
    );
}
