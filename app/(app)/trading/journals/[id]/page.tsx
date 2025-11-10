import { Suspense } from "react";
import { orpc } from "@/orpc/client";
import { getQueryClient, HydrateClient } from "@/orpc/query/hydration";
import { JournalPageClient } from "./page.client";

export default async function JournalPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const queryClient = getQueryClient();

    await queryClient.prefetchQuery(
        orpc.trading.getJournalById.queryOptions({ input: { id } })
    );

    await Promise.all([
        queryClient.prefetchQuery(
            orpc.trading.getTrades.queryOptions({
                input: {
                    journalId: id,
                },
            })
        ),
        queryClient.prefetchQuery(
            orpc.trading.getStats.queryOptions({
                input: {
                    journalId: id,
                },
            })
        ),
        queryClient.prefetchQuery(
            orpc.trading.getSessions.queryOptions({
                input: { journalId: id },
            })
        ),
        queryClient.prefetchQuery(
            orpc.trading.getSetups.queryOptions({
                input: { journalId: id },
            })
        ),
    ]);

    return (
        <HydrateClient client={queryClient}>
            <Suspense
                fallback={
                    <div className="container mx-auto px-4 py-8">
                        <div className="animate-pulse">
                            <div className="mb-6 h-8 w-1/4 rounded bg-gray-200" />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {new Array(4).map((_, i) => (
                                    <div
                                        className="h-32 rounded bg-gray-200"
                                        key={i}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                }
            >
                <JournalPageClient journalId={id} />
            </Suspense>
        </HydrateClient>
    );
}
