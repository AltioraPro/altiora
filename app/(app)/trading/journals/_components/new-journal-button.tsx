"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateJournalStore } from "@/stores/create-journal-store";

export function NewJournalButton() {
    const { open } = useCreateJournalStore();

    return (
        <Button onClick={open} variant="primary">
            <Plus className="mr-2 size-4" />
            New Journal
        </Button>
    );
}
