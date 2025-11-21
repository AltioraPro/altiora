import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { ProfilePageClient } from "./page.client";

export default function ProfilePage() {
    const queryClient = getQueryClient();

    Promise.all([
        queryClient.prefetchQuery(orpc.auth.getCurrentUser.queryOptions({})),
        queryClient.prefetchQuery(orpc.profile.getUserStats.queryOptions({})),
        queryClient.prefetchQuery(
            orpc.profile.getHabitHeatmap.queryOptions({})
        ),
    ]);

    return (
        <HydrateClient client={queryClient}>
            <ProfilePageClient />
        </HydrateClient>
    );
}
