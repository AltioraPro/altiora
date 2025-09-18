"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { JournalPerformanceCard } from "./JournalPerformanceCard";
import type { TradingJournal } from "@/server/db/schema";
import { GripVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  showSelection = false
}: DraggableJournalCardProps) {
  const {
    attributes,
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
      ref={setNodeRef} 
      style={style} 
      className={`relative group ${sortableIsDragging ? 'z-50' : ''} ${isSelected ? 'ring-2 ring-white/50' : ''}`}
    >
      {/* Selection Checkbox */}
      {showSelection && onSelect && (
        <div className="absolute top-2 right-2 z-20">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(journal.id, checked as boolean)}
            className="bg-black/50 border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
          />
        </div>
      )}

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="bg-black/50 rounded p-1 backdrop-blur-sm">
          <GripVertical className="w-4 h-4 text-white/60" />
        </div>
      </div>

      {/* Journal Card */}
      <div className={sortableIsDragging ? 'pointer-events-none' : ''}>
        <JournalPerformanceCard
          journal={journal}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
