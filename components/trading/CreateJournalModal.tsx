"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { api } from "@/trpc/client";

interface CreateJournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateJournalModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateJournalModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startingCapital, setStartingCapital] = useState("");
    const [usePercentageCalculation, setUsePercentageCalculation] =
        useState(false);

    const createJournalMutation = api.trading.createJournal.useMutation({
        onSuccess: () => {
            setName("");
            setDescription("");
            setStartingCapital("");
            setUsePercentageCalculation(false);
            onSuccess?.();
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("Journal name is required");
            return;
        }

        try {
            await createJournalMutation.mutateAsync({
                name: name.trim(),
                description: description.trim(),
                startingCapital: startingCapital.trim() || undefined,
                usePercentageCalculation,
            });
        } catch (error) {
            console.error("Error creating journal:", error);
        }
    };

    const handleClose = () => {
        if (!createJournalMutation.isPending) {
            setName("");
            setDescription("");
            setStartingCapital("");
            setUsePercentageCalculation(false);
            onClose();
        }
    };

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent className="border-white/20 bg-black text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        Create a new journal
                    </DialogTitle>
                    <DialogDescription className="text-white/70">
                        Create a new trading journal to organize your trades and
                        track your performance. Enable percentage calculation
                        for automatic BE/TP/SL detection.
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
                                disabled={createJournalMutation.isPending}
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
                                disabled={createJournalMutation.isPending}
                                id="description"
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional journal description"
                                rows={3}
                                value={description}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={usePercentageCalculation}
                                disabled={createJournalMutation.isPending}
                                id="usePercentageCalculation"
                                onCheckedChange={(checked) =>
                                    setUsePercentageCalculation(
                                        checked as boolean
                                    )
                                }
                            />
                            <Label
                                className="text-sm text-white/80"
                                htmlFor="usePercentageCalculation"
                            >
                                Use percentage calculation
                            </Label>
                        </div>
                        {usePercentageCalculation && (
                            <div className="grid gap-2">
                                <Label
                                    className="text-white/80"
                                    htmlFor="startingCapital"
                                >
                                    Starting capital
                                </Label>
                                <Input
                                    className="border-white/30 bg-black text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                                    disabled={createJournalMutation.isPending}
                                    id="startingCapital"
                                    onChange={(e) =>
                                        setStartingCapital(e.target.value)
                                    }
                                    placeholder="Ex: 10000"
                                    step="0.01"
                                    type="number"
                                    value={startingCapital}
                                />
                                <p className="text-white/50 text-xs">
                                    The starting capital allows to calculate
                                    percentages automatically when creating
                                    trades
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            className="border-white/30 text-black transition-colors hover:bg-white hover:text-black"
                            disabled={createJournalMutation.isPending}
                            onClick={handleClose}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-white text-black transition-colors hover:bg-white/90"
                            disabled={
                                createJournalMutation.isPending || !name.trim()
                            }
                            type="submit"
                        >
                            {createJournalMutation.isPending
                                ? "Creating..."
                                : "Create journal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
