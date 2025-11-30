import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { HabitsProvider } from "@/app/(app)/habits/_components/habits-provider";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { HabitsPageClient } from "./page.client";
import { habitsSearchParamsCache } from "./search-params";

export default async function HabitsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const { viewMode } = await habitsSearchParamsCache.parse(searchParams);

    const queryClient = getQueryClient();

    await queryClient.prefetchQuery(
        orpc.habits.getDashboard.queryOptions({
            input: { viewMode },
        })
    );

    return (
        <HydrateClient client={queryClient}>
            <HabitsProvider>
                <Suspense>
                    <HabitsPageClient />
                </Suspense>
            </HabitsProvider>
        </HydrateClient>
    );
}
