"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { DraggableJournalCard } from "./DraggableJournalCard";
import type { TradingJournal } from "@/server/db/schema";

interface DraggableJournalListProps {
  journals: TradingJournal[];
  onReorder: (journalIds: string[]) => void;
  onEdit: (journal: TradingJournal) => void;
  onDelete: (journal: TradingJournal) => void;
  onSetDefault: (journal: TradingJournal) => void;
}

export function DraggableJournalList({
  journals,
  onReorder,
  onEdit,
  onDelete,
  onSetDefault,
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

  // Update items when journals prop changes (only if it's a real change from server)
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
      
      // Call the reorder callback with the new order (optimistic update)
      onReorder(newItems.map(item => item.id));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext items={items.map(j => j.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((journal) => (
            <DraggableJournalCard
              key={journal.id}
              journal={journal}
              onEdit={() => onEdit(journal)}
              onDelete={() => onDelete(journal)}
              onSetDefault={() => onSetDefault(journal)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
