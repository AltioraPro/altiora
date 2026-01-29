"use client";

import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import type { TradingJournal } from "@/server/db/schema";
import { useEditJournalStore } from "@/store/edit-journal-store";
import { MinimalJournalCard } from "./minimal-journal-card";

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
    const [items, setItems] = useState(journals);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        setItems(journals);
    }, [journals]);

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over?.id);

            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);

            onReorder(newItems.map((item) => item.id));
        }
    }

    return (
        <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
        >
            <SortableContext
                items={items.map((j) => j.id)}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((journal) => (
                        <MinimalJournalCard
                            journal={journal}
                            key={journal.id}
                            onDelete={() => onDelete(journal.id)}
                            onEdit={() => openEditModal(journal)}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
