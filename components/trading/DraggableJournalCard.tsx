"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RiDraggable } from "@remixicon/react";
import { Checkbox } from "@/components/ui/checkbox";
import type { TradingJournal } from "@/server/db/schema";
import { JournalPerformanceCard } from "./JournalPerformanceCard";

interface DraggableJournalCardProps {
    journal: TradingJournal;
    onEdit: () => void;
    onDelete: () => void;
    isSelected?: boolean;
    onSelect?: (journalId: string, selected: boolean) => void;
    showSelection?: boolean;
}

export function DraggableJournalCard({
    journal,
    onEdit,
    onDelete,
    isSelected = false,
    onSelect,
    showSelection = false,
}: DraggableJournalCardProps) {
    const {
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: sortableIsDragging,
    } = useSortable({ id: journal.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: sortableIsDragging ? 0.5 : 1,
    };

    return (
        <div
            className={`group relative ${sortableIsDragging ? "z-50" : ""} ${isSelected ? "ring-2 ring-white/50" : ""}`}
            ref={setNodeRef}
            style={style}
        >
            {/* Selection Checkbox */}
            {showSelection && onSelect && (
                <div className="absolute top-2 right-2 z-20">
                    <Checkbox
                        checked={isSelected}
                        className="border-white/30 bg-black/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                        onCheckedChange={(checked) =>
                            onSelect(journal.id, Boolean(checked))
                        }
                    />
                </div>
            )}

            {/* Drag Handle */}
            <div
                className="absolute top-2 left-2 z-10 cursor-grab opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
                {...listeners}
            >
                <div className="rounded bg-black/50 p-1 backdrop-blur-xs">
                    <RiDraggable className="size-4 text-white/60" />
                </div>
            </div>

            {/* Journal Card */}
            <div className={sortableIsDragging ? "pointer-events-none" : ""}>
                <JournalPerformanceCard
                    journal={journal}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            </div>
        </div>
    );
}
