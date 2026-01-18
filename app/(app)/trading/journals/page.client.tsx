"use client";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DeleteJournalDialog } from "@/components/trading/DeleteJournalDialog";
import { orpc } from "@/orpc/client";
import type { TradingJournal } from "@/server/db/schema";
import { EmptyJournalsState } from "./_components/empty-journals-state";
import { JournalsList } from "./_components/journals-list";

export function JournalsPageClient() {
    const [journalToDelete, setJournalToDelete] =
        useState<TradingJournal | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: journals, isLoading: journalsLoading } = useSuspenseQuery(
        orpc.trading.getJournals.queryOptions({ input: {} })
    );

    const { mutateAsync: deleteJournal } = useMutation(
        orpc.trading.deleteJournal.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getJournals.queryKey({ input: {} }),
                ],
            },
        })
    );

    const { mutateAsync: reorderJournals } = useMutation(
        orpc.trading.reorderJournals.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getJournals.queryKey({ input: {} }),
                ],
            },
        })
    );

    const handleDeleteRequest = (journalId: string) => {
        const journal = journals.find((j) => j.id === journalId);
        if (journal) {
            setJournalToDelete(journal);
            setIsDeleteDialogOpen(true);
        }
    };

    const handleDeleteConfirm = async (journalId: string) => {
        await deleteJournal({ id: journalId });
        setJournalToDelete(null);
    };

    const handleReorderJournals = async (journalIds: string[]) => {
        await reorderJournals({ journalIds });
    };

    if (journalsLoading) {
        return (
            <div className="animate-pulse">
                <div className="mb-6 h-8 w-1/4 rounded bg-gray-200" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {new Array(8).map((_, i) => (
                        <div className="h-64 rounded-lg bg-gray-200" key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (journals.length === 0) {
        return <EmptyJournalsState />;
    }

    return (
        <>
            <JournalsList
                journals={journals}
                onDelete={handleDeleteRequest}
                onReorder={handleReorderJournals}
            />
            <DeleteJournalDialog
                journal={journalToDelete}
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}
