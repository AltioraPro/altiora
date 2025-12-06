import { Suspense } from "react";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { DashboardLoading } from "./_components/dashboard-loading";
import { DashboardPageClient } from "./page.client";

export default async function GlobalDashboardPage() {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery(
        orpc.trading.getJournals.queryOptions({ input: {} })
    );

    await Promise.all([
        queryClient.prefetchQuery(
            orpc.trading.getSessions.queryOptions({ input: {} })
        ),
        queryClient.prefetchQuery(
            orpc.trading.getTrades.queryOptions({ input: {} })
        ),
        queryClient.prefetchQuery(
            orpc.trading.getStats.queryOptions({ input: {} })
        ),
        queryClient.prefetchQuery(
            orpc.habits.getDashboard.queryOptions({ input: { viewMode: "week" } })
        ),
        queryClient.prefetchQuery(
            orpc.goals.getAll.queryOptions({ input: undefined })
        ),
        queryClient.prefetchQuery(
            orpc.profile.getUserStats.queryOptions({ input: undefined })
        ),
    ]);

    return (
        <HydrateClient client={queryClient}>
            <Suspense fallback={<DashboardLoading />}>
                <DashboardPageClient />
            </Suspense>
        </HydrateClient>
    );
}
