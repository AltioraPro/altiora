"use client";

import { RiAddLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { useCreateJournalStore } from "@/stores/create-journal-store";

export function NewJournalButton() {
    const { open } = useCreateJournalStore();

    return (
        <Button onClick={open} variant="primary">
            <RiAddLine className="mr-2 size-4" />
            New Journal
        </Button>
    );
}
