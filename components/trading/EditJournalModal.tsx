"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/orpc/client";
import type { TradingJournal } from "@/server/db/schema";

interface EditJournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    journal: Pick<TradingJournal, "id" | "name" | "description">;
    onSuccess?: () => void;
}

export function EditJournalModal({
    isOpen,
    onClose,
    journal,
    onSuccess,
}: EditJournalModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (journal) {
            setName(journal.name || "");
            setDescription(journal.description || "");
        }
    }, [journal]);

    const { mutateAsync: updateJournal, isPending: isUpdatingJournal } =
        useMutation(
            orpc.trading.updateJournal.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.trading.getJournals.queryKey({ input: {} }),
                    ],
                },
                onSuccess: () => {
                    onSuccess?.();
                },
            })
        );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            console.error("Journal name is required");
            return;
        }

        try {
            await updateJournal({
                id: journal.id,
                name: name.trim(),
                description: description.trim(),
            });
        } catch (error) {
            console.error("Error updating journal:", error);
        }
    };

    const handleClose = () => {
        if (!isUpdatingJournal) {
            onClose();
        }
    };

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent className="border-white/20 bg-black text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        Edit journal
                    </DialogTitle>
                    <DialogDescription className="text-white/70">
                        Edit your trading journal information.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label className="text-white/80" htmlFor="name">
                                Journal name *
                            </Label>
                            <Input
                                className="border-white/30 bg-black text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                                disabled={isUpdatingJournal}
                                id="name"
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Main Journal"
                                value={name}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label
                                className="text-white/80"
                                htmlFor="description"
                            >
                                Description
                            </Label>
                            <Textarea
                                className="border-white/30 bg-black text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                                disabled={isUpdatingJournal}
                                id="description"
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional journal description"
                                rows={3}
                                value={description}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="border-white/30 text-white transition-colors hover:bg-white hover:text-black"
                            disabled={isUpdatingJournal}
                            onClick={handleClose}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-white text-black transition-colors hover:bg-white/90"
                            disabled={isUpdatingJournal || !name.trim()}
                            type="submit"
                        >
                            {isUpdatingJournal ? "Updating..." : "Update"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
