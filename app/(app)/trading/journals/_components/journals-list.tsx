"use client";

import { DraggableJournalList } from "@/components/trading/DraggableJournalList";
import type { TradingJournal } from "@/server/db/schema";
import { useEditJournalStore } from "@/store/edit-journal-store";

interface JournalsListProps {
    journals: TradingJournal[];
    onDelete: (journalId: string) => void;
    onReorder: (journalIds: string[]) => void;
}

export function JournalsList({
    journals,
    onDelete,
    onReorder,
}: JournalsListProps) {
    const { open: openEditModal } = useEditJournalStore();

    return (
        <DraggableJournalList
            journals={journals}
            onDelete={(journal) => onDelete(journal.id)}
            onEdit={openEditModal}
            onReorder={onReorder}
        />
    );
}
