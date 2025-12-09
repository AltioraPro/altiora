import { Suspense } from "react";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { JournalFilter } from "../dashboard/_components/journal-filter";
import { TradingPageClient } from "./page.client";

export default async function TradingPage() {
    const queryClient = getQueryClient();

    await Promise.all([
        queryClient.prefetchQuery(
            orpc.trading.getJournalsFilter.queryOptions()
        ),
        queryClient.prefetchQuery(
            orpc.trading.getTrades.queryOptions({ input: {} })
        ),
        queryClient.prefetchQuery(
            orpc.trading.getStats.queryOptions({ input: {} })
        ),
        queryClient.prefetchQuery(
            orpc.habits.getDashboard.queryOptions({
                input: { viewMode: "week" },
            })
        ),
        queryClient.prefetchQuery(
            orpc.goals.getAll.queryOptions({ input: undefined })
        ),
    ]);

    return (
        <div className="px-6 py-8">
            <HydrateClient client={queryClient}>
                <Suspense fallback={<div>Loading...</div>}>
                    <JournalFilter />
                </Suspense>
                <Suspense fallback={<div>Loading...</div>}>
                    <TradingPageClient />
                </Suspense>
            </HydrateClient>
        </div>
    );
}
