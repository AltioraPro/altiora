"use client";

import { RiDeleteBinLine, RiLoader2Line } from "@remixicon/react";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { TradingJournal } from "@/server/db/schema";

interface DeleteJournalDialogProps {
    journal: TradingJournal | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (journalId: string) => Promise<void>;
}

export function DeleteJournalDialog({
    journal,
    open,
    onOpenChange,
    onConfirm,
}: DeleteJournalDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (!journal) return;

        setIsDeleting(true);
        try {
            await onConfirm(journal.id);
            onOpenChange(false);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="border-zinc-800 bg-zinc-950 rounded-none">
                <AlertDialogHeader>
                    <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50 ring-1 ring-zinc-700/50">
                        <RiDeleteBinLine className="h-5 w-5 text-red-400" />
                    </div>
                    <AlertDialogTitle className="text-center text-white">
                        Delete this journal?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-zinc-400">
                        <span className="font-medium text-zinc-300">
                            {journal?.name}
                        </span>{" "}
                        and all its trades will be permanently deleted.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 sm:justify-center">
                    <AlertDialogCancel
                        className="border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
                        disabled={isDeleting}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-50"
                        disabled={isDeleting}
                        onClick={(e) => {
                            e.preventDefault();
                            handleConfirm();
                        }}
                    >
                        {isDeleting ? (
                            <>
                                <RiLoader2Line className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
