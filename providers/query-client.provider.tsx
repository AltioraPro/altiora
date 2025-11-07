"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { env } from "@/env";
import { createQueryClient } from "@/orpc/query/client";

export function ORPCQueryClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => createQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {env.NEXT_PUBLIC_REACT_QUERY_DEVTOOLS === "true" && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
            {children}
        </QueryClientProvider>
    );
}
