import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { SettingsSidebar } from "./_components/settings-sidebar";
import { SettingsPageClient } from "./page.client";
import { searchParamsCache } from "./search-params";

export default async function SettingsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const queryClient = getQueryClient();
    const { page } = await searchParamsCache.parse(searchParams);

    // Only prefetch essential data - checkBotStatus is slow and not needed for initial render
    await Promise.all([
        queryClient.prefetchQuery(orpc.auth.getCurrentUser.queryOptions({})),
        queryClient.prefetchQuery(
            orpc.discord.getConnectionStatus.queryOptions({})
        ),
        // Removed checkBotStatus - it has a 5s timeout and blocks rendering
        // It will be fetched client-side when DiscordConnection component mounts
    ]);

    return (
        <HydrateClient client={queryClient}>
            <div className="flex max-h-[calc(100vh-70px)] w-full">
                <SettingsSidebar currentPage={page} />

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl px-6">
                        <Suspense
                            fallback={
                                <div className="h-32 animate-pulse rounded-lg bg-white/5" />
                            }
                        >
                            <SettingsPageClient />
                        </Suspense>
                    </div>
                </div>
            </div>
            <DiscordWelcomeChecker forceShow={true} />
        </HydrateClient>
    );
}
