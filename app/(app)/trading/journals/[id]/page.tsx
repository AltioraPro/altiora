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
            orpc.trading.getConfirmations.queryOptions({
                input: { journalId: id },
            })
        ),
    ]);

    return (
        <HydrateClient client={queryClient}>
            <Suspense>
                <JournalPageClient journalId={id} />
            </Suspense>
        </HydrateClient>
    );
}
