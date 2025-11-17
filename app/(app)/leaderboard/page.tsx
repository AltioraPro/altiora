import type { SearchParams } from "nuqs/server";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { LeaderboardPageClient } from "./page.client";
import { searchParamsCache } from "./search-params";

export default async function LeaderboardPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const queryClient = getQueryClient();
    const { period } = await searchParamsCache.parse(searchParams);

    await queryClient.prefetchQuery(
        orpc.leaderboard.getLeaderboard.queryOptions({
            input: { period },
        })
    );

    return (
        <HydrateClient client={queryClient}>
            <LeaderboardPageClient />
        </HydrateClient>
    );
}
