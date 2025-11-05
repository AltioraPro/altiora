"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckSquare, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateGoalModal } from "@/components/goals/CreateGoalModal";
import SpotlightCard from "@/components/SpotlightCard";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/constants/pages";
import { orpc } from "@/orpc/client";

function generateSampleGoals() {
    return [
        {
            title: "Achieve 60% Win Rate",
            description:
                "Improve trading consistency by focusing on quality setups and proper risk management. Track progress weekly and adjust strategy as needed.",
            type: "quarterly" as const,
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            reminderFrequency: "weekly" as const,
        },
        {
            title: "Build $10k Trading Capital",
            description:
                "Grow trading account from $5k to $10k through consistent profits and disciplined risk management. Focus on 1-2% risk per trade.",
            type: "annual" as const,
            deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            reminderFrequency: "monthly" as const,
        },
    ];
}

export function CreateGoalCard() {
    const router = useRouter();
    const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);

    const { mutateAsync: createGoals, isPending: isCreatingGoals } =
        useMutation(
            orpc.goals.batchCreate.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.goals.getPaginated.queryKey({ input: {} }),
                        orpc.goals.getStats.queryKey({ input: {} }),
                        orpc.goals.getAll.queryKey({ input: {} }),
                    ],
                },
            })
        );

    const handleGenerateGoalExample = async () => {
        const sampleGoals = generateSampleGoals();
        await createGoals(sampleGoals);
        router.push(PAGES.GOALS);
    };

    return (
        <>
            <SpotlightCard className="group border border-white/10 p-0">
                <div className="flex h-full flex-col p-6">
                    <div className="relative mb-6 flex h-48 items-center justify-center overflow-hidden rounded-lg border border-white/5">
                        <div className="absolute inset-0 bg-grid-white/[0.02]" />

                        <div className="absolute inset-0 flex items-center justify-center p-6">
                            <div className="w-full max-w-[200px] space-y-3">
                                <div className="rounded-lg border border-white/30 bg-linear-to-br from-white/15 to-white/5 p-3 shadow-lg transition-all duration-500 group-hover:translate-x-[-2px] group-hover:shadow-xl">
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-green-400 bg-green-400/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_8px_rgba(74,222,128,0.6)]">
                                            <CheckSquare className="h-2.5 w-2.5 text-green-400" />
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-2 w-3/4 rounded bg-white/30 transition-all duration-300 group-hover:bg-white/40" />
                                            <div className="h-1 w-full rounded bg-white/15 transition-all duration-300 group-hover:bg-white/25" />
                                            <div className="mt-2 flex items-center gap-1">
                                                <div
                                                    className="h-1 rounded-full bg-green-400 transition-all duration-700 group-hover:shadow-[0_0_8px_rgba(74,222,128,0.4)]"
                                                    style={{
                                                        width: "75%",
                                                    }}
                                                />
                                                <div className="text-[7px] text-green-400 transition-all duration-300 group-hover:font-semibold">
                                                    75%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="scale-105 transform rounded-lg border border-white/40 bg-linear-to-br from-white/20 to-white/10 p-3 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:border-blue-400/50 group-hover:shadow-2xl">
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-blue-400 transition-all duration-300 group-hover:bg-blue-400/20 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-2 w-4/5 rounded bg-white/40 transition-all duration-300 group-hover:bg-white/50" />
                                            <div className="h-1 w-full rounded bg-white/20 transition-all duration-300 group-hover:bg-white/30" />
                                            <div className="mt-2 flex items-center gap-1">
                                                <div
                                                    className="h-1 rounded-full bg-blue-400 transition-all duration-700 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.4)]"
                                                    style={{
                                                        width: "45%",
                                                    }}
                                                />
                                                <div
                                                    className="h-1 rounded-full bg-white/20 transition-all duration-300 group-hover:bg-white/30"
                                                    style={{
                                                        width: "55%",
                                                    }}
                                                />
                                                <div className="text-[7px] text-blue-400 transition-all duration-300 group-hover:font-semibold">
                                                    45%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-lg border border-white/25 bg-linear-to-br from-white/10 to-white/5 p-3 shadow-md transition-all duration-500 group-hover:translate-x-[2px] group-hover:border-white/35">
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-white/40 transition-all duration-300 group-hover:border-white/60" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-2 w-2/3 rounded bg-white/25 transition-all duration-300 group-hover:bg-white/35" />
                                            <div className="h-1 w-5/6 rounded bg-white/15 transition-all duration-300 group-hover:bg-white/25" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3 className="mb-3 font-semibold text-lg text-white">
                        Create a Goal
                    </h3>
                    <p className="mb-6 flex-1 text-sm text-white/60 leading-relaxed">
                        Create your first goal to start building your objectives
                        knowledge base.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            className="bg-white font-medium text-black shadow-lg hover:bg-gray-100"
                            disabled={isCreatingGoals}
                            onClick={() => setIsCreateGoalModalOpen(true)}
                        >
                            + Create Goal
                        </Button>
                        <button
                            className="flex items-center justify-center gap-2 py-2 text-sm text-white/50 transition-colors hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isCreatingGoals}
                            onClick={handleGenerateGoalExample}
                            title="Generate example goal"
                            type="button"
                        >
                            <Sparkles className="h-4 w-4" />
                            {isCreatingGoals
                                ? "Generating..."
                                : "Generate example"}
                        </button>
                    </div>
                </div>
            </SpotlightCard>

            <CreateGoalModal
                isOpen={isCreateGoalModalOpen}
                onClose={() => setIsCreateGoalModalOpen(false)}
                onSuccess={() => router.push(PAGES.GOALS)}
            />
        </>
    );
}
