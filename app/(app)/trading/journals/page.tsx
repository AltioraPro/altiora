import { Suspense } from "react";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { JournalsHeader } from "./_components/journals-header";
import { JournalsPageClient } from "./page.client";

export default async function JournalsPage() {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery(
        orpc.trading.getJournals.queryOptions({ input: {} })
    );

    return (
        <div className="px-6 py-8">
            <JournalsHeader />
            <HydrateClient client={queryClient}>
                <Suspense>
                    <JournalsPageClient />
                </Suspense>
            </HydrateClient>
        </div>
    );
}
