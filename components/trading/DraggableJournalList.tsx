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
import { DraggableJournalCard } from "./DraggableJournalCard";

interface DraggableJournalListProps {
    journals: TradingJournal[];
    onReorder: (journalIds: string[]) => void;
    onEdit: (journal: TradingJournal) => void;
    onDelete: (journal: TradingJournal) => void;
    selectedJournalIds?: string[];
    onSelectionChange?: (selectedIds: string[]) => void;
    showSelection?: boolean;
}

export function DraggableJournalList({
    journals,
    onReorder,
    onEdit,
    onDelete,
    selectedJournalIds = [],
    onSelectionChange,
    showSelection = false,
}: DraggableJournalListProps) {
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

    const handleJournalSelect = (journalId: string, selected: boolean) => {
        if (!onSelectionChange) return;

        if (selected) {
            onSelectionChange([...selectedJournalIds, journalId]);
        } else {
            onSelectionChange(
                selectedJournalIds.filter((id) => id !== journalId)
            );
        }
    };

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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((journal) => (
                        <DraggableJournalCard
                            isSelected={selectedJournalIds.includes(journal.id)}
                            journal={journal}
                            key={journal.id}
                            onDelete={() => onDelete(journal)}
                            onEdit={() => onEdit(journal)}
                            onSelect={handleJournalSelect}
                            showSelection={showSelection}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
