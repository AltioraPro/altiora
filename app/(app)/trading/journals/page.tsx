import { Suspense } from "react";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { JournalsHeader } from "./_components/journals-header";
import { JournalsPageClient } from "./page.client";

function JournalsLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="h-50 animate-pulse rounded-xl border border-white/8 bg-white/2"
                />
            ))}
        </div>
    );
}

export default async function JournalsPage() {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery(
        orpc.trading.getJournals.queryOptions({ input: {} })
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <JournalsHeader />
            <HydrateClient client={queryClient}>
                <Suspense fallback={<JournalsLoadingSkeleton />}>
                    <JournalsPageClient />
                </Suspense>
            </HydrateClient>
        </div>
    );
}
