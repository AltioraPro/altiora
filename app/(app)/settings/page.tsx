import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
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

    const prefetchPromises: Promise<unknown>[] = [];

    if (!page || page === "account-billing" || page === "privacy") {
        prefetchPromises.push(
            queryClient.prefetchQuery(orpc.auth.getCurrentUser.queryOptions())
        );
    }

    if (page === "security") {
        prefetchPromises.push(
            queryClient.prefetchQuery(orpc.auth.getSessions.queryOptions())
        );
    }

    if (prefetchPromises.length > 0) {
        await Promise.all(prefetchPromises);
    }

    return (
        <HydrateClient client={queryClient}>
            <div className="flex max-h-[calc(100vh-70px)] w-full">
                <SettingsSidebar currentPage={page} />

                <Suspense
                    fallback={
                        <div className="h-32 animate-pulse rounded-lg bg-white/5" />
                    }
                >
                    <div className="w-full overflow-y-scroll">
                        <SettingsPageClient />
                    </div>
                </Suspense>
            </div>
        </HydrateClient>
    );
}
