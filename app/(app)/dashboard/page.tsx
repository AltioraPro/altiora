import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { DashboardPageClient } from "./page.client";
import { searchParamsCache } from "./search-params";

export default async function GlobalDashboardPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const queryClient = getQueryClient();
    const { journalIds } = await searchParamsCache.parse(searchParams);

    const queryInput = (() => {
        if (!journalIds || journalIds.length === 0) {
            return {};
        }
        if (journalIds.length === 1) {
            return { journalId: journalIds[0] };
        }
        return { journalIds };
    })();

    await queryClient.prefetchQuery(
        orpc.trading.getJournals.queryOptions({ input: {} })
    );

    await Promise.all([
        queryClient.prefetchQuery(
            orpc.trading.getSessions.queryOptions({ input: queryInput })
        ),
        queryClient.prefetchQuery(
            orpc.trading.getTrades.queryOptions({ input: queryInput })
        ),
        queryClient.prefetchQuery(
            orpc.trading.getStats.queryOptions({ input: queryInput })
        ),
    ]);

    return (
        <HydrateClient client={queryClient}>
            <Suspense>
                <DashboardPageClient />
            </Suspense>
        </HydrateClient>
    );
}
