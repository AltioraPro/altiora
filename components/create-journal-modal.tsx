"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    RiPencilLine,
    RiRobot2Line,
    RiExchangeLine,
    RiArrowRightLine,
} from "@remixicon/react";
import { useCreateJournalStore } from "@/store/create-journal-store";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";
import { toast } from "sonner";

type JournalSource = "manual" | "ctrader" | "metatrader" | null;

export function CreateJournalModal() {
    const router = useRouter();
    const { isOpen, close } = useCreateJournalStore();
    const [step, setStep] = useState<"source" | "details">("source");
    const [selectedSource, setSelectedSource] = useState<JournalSource>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startingCapital, setStartingCapital] = useState("10000");

    const { mutateAsync: createJournal, isPending } = useMutation(
        orpc.trading.createJournal.mutationOptions({
            meta: {
                invalidateQueries: [orpc.trading.getJournals.queryKey({ input: {} })],
            },
        }),
    );

    const handleSourceSelect = async (source: JournalSource) => {
        setSelectedSource(source);

        if (source === "manual") {
            setStep("details");
        } else if (source === "ctrader") {
            // Create journal first, then redirect to OAuth
            try {
                const journal = await createJournal({
                    name: "cTrader Account",
                    description: "Auto-synced from cTrader",
                    startingCapital: "10000",
                    usePercentageCalculation: true,
                });
                close();
                window.location.href = `/api/integrations/ctrader/authorize?journalId=${journal.id}`;
            } catch (error) {
                toast.error("Failed to create journal");
            }
        } else if (source === "metatrader") {
            // Redirect to MetaTrader integration
            close();
            toast.info("MetaTrader integration coming soon!");
        }
    };

    const handleCreateManual = async () => {
        try {
            const journal = await createJournal({
                name,
                description,
                startingCapital,
                usePercentageCalculation: true,
            });

            toast.success("Journal created successfully!");
            close();
            router.push(`/trading/journals/${journal.id}`);
        } catch (error) {
            toast.error("Failed to create journal");
        }
    };

    const handleClose = () => {
        close();
        // Reset state after animation
        setTimeout(() => {
            setStep("source");
            setSelectedSource(null);
            setName("");
            setDescription("");
            setStartingCapital("10000");
        }, 200);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] border-white/10 bg-black/95 backdrop-blur-xl">
                {step === "source" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-white">
                                Choose Journal Type
                            </DialogTitle>
                            <DialogDescription className="text-white/60">
                                Select how you want to track your trades
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-6">
                            {/* Manual Entry */}
                            <button
                                onClick={() => handleSourceSelect("manual")}
                                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 text-left transition-all hover:border-white/20 hover:from-white/10 hover:shadow-xl"
                            >
                                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                                <div className="relative flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 transition-all group-hover:bg-white/15 group-hover:scale-110">
                                        <RiPencilLine className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-1 font-semibold text-lg text-white">
                                            Manual Entry
                                        </h3>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            Create a traditional journal and manually log your trades.
                                            Full control over every detail.
                                        </p>
                                    </div>
                                    <RiArrowRightLine className="h-5 w-5 text-white/40 transition-all group-hover:translate-x-1 group-hover:text-white/70" />
                                </div>
                            </button>

                            {/* cTrader */}
                            <button
                                onClick={() => handleSourceSelect("ctrader")}
                                className="group relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-6 text-left transition-all hover:border-blue-500/30 hover:from-blue-500/15 hover:shadow-xl hover:shadow-blue-500/10"
                            >
                                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                                <div className="relative flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 transition-all group-hover:bg-blue-500/30 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/20">
                                        <RiExchangeLine className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <h3 className="font-semibold text-lg text-white">
                                                cTrader Account
                                            </h3>
                                            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400 font-medium">
                                                Auto-sync
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            Connect your cTrader account for automatic position
                                            synchronization and real-time updates.
                                        </p>
                                    </div>
                                    <RiArrowRightLine className="h-5 w-5 text-blue-400/40 transition-all group-hover:translate-x-1 group-hover:text-blue-400" />
                                </div>
                            </button>

                            {/* MetaTrader */}
                            <button
                                onClick={() => handleSourceSelect("metatrader")}
                                className="group relative overflow-hidden rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent p-6 text-left transition-all hover:border-green-500/30 hover:from-green-500/15 hover:shadow-xl hover:shadow-green-500/10"
                            >
                                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                                <div className="relative flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20 transition-all group-hover:bg-green-500/30 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-green-500/20">
                                        <RiRobot2Line className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <h3 className="font-semibold text-lg text-white">
                                                MetaTrader 4/5
                                            </h3>
                                            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400 font-medium">
                                                Premium
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            Connect MT4/MT5 for full trade history synchronization and
                                            advanced analytics.
                                        </p>
                                    </div>
                                    <RiArrowRightLine className="h-5 w-5 text-green-400/40 transition-all group-hover:translate-x-1 group-hover:text-green-400" />
                                </div>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-white">
                                Create Manual Journal
                            </DialogTitle>
                            <DialogDescription className="text-white/60">
                                Set up your trading journal details
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-white">
                                    Journal Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="My Trading Journal"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-white">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Track my day trading performance..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capital" className="text-white">
                                    Starting Capital
                                </Label>
                                <Input
                                    id="capital"
                                    type="number"
                                    placeholder="10000"
                                    value={startingCapital}
                                    onChange={(e) => setStartingCapital(e.target.value)}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep("source")}
                                className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5"
                                disabled={isPending}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleCreateManual}
                                className="flex-1 bg-white text-black hover:bg-gray-100"
                                disabled={isPending || !name}
                            >
                                {isPending ? "Creating..." : "Create Journal"}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
