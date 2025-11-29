"use client";

import { RiSparklingLine, RiSquareFill, RiSquareLine } from "@remixicon/react";
import { useHabits } from "@/app/(app)/habits/_components/habits-provider";
import SpotlightCard from "@/components/SpotlightCard";
import { Button } from "@/components/ui/button";

interface HabitCardProps {
    isGenerating: boolean;
    onGenerateExample: () => void;
}

export function HabitCard({ isGenerating, onGenerateExample }: HabitCardProps) {
    const { openCreateModal } = useHabits();

    return (
        <SpotlightCard className="group border border-white/10 p-0">
            <div className="flex h-full flex-col p-6">
                <div className="relative mb-6 flex h-48 items-center justify-center overflow-hidden rounded-lg border border-white/5">
                    <div className="absolute inset-0 bg-grid-white/[0.02]" />

                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="space-y-3">
                            <div className="mb-2 flex justify-center gap-1">
                                {["M", "T", "W", "T", "F", "S", "S"].map(
                                    (day, i) => (
                                        <div
                                            className="flex h-5 w-7 items-center justify-center"
                                            key={i}
                                        >
                                            <span className="text-[8px] text-white/40">
                                                {day}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="flex justify-center gap-1">
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <RiSquareLine className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="h-7 w-7 rounded border border-white/20 bg-white/10 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/15" />
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <RiSquareLine className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <RiSquareLine className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <RiSquareLine className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="h-7 w-7 rounded border border-white/20 bg-white/10 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/15" />
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <RiSquareLine className="h-3 w-3 text-green-400" />
                                </div>
                            </div>

                            <div className="flex justify-center gap-1">
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <RiSquareLine className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <RiSquareLine className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="h-7 w-7 rounded border border-white/20 bg-white/10 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/15" />
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <RiSquareFill className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <RiSquareFill className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <RiSquareFill className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <RiSquareFill className="h-3 w-3 text-green-400" />
                                </div>
                            </div>

                            {/* Week 3 */}
                            <div className="flex justify-center gap-1">
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <RiSquareFill className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="h-7 w-7 rounded border border-white/20 bg-white/10 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/15" />
                                <div className="flex h-7 w-7 scale-110 transform items-center justify-center rounded border-2 border-blue-400 bg-linear-to-br from-blue-400/40 to-blue-500/40 shadow-xl transition-all duration-500 group-hover:scale-125 group-hover:border-blue-300 group-hover:shadow-[0_0_16px_rgba(96,165,250,0.6)]">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                                </div>
                                <div className="h-7 w-7 rounded border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10" />
                                <div className="h-7 w-7 rounded border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10" />
                                <div className="h-7 w-7 rounded border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10" />
                                <div className="h-7 w-7 rounded border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10" />
                            </div>
                        </div>
                    </div>
                </div>
                <h3 className="mb-3 font-semibold text-lg text-white">
                    Create a Habit
                </h3>
                <p className="mb-6 flex-1 text-sm text-white/60 leading-relaxed">
                    Create your first habit to start building your daily routine
                    knowledge base.
                </p>
                <div className="flex flex-col gap-3">
                    <Button
                        className="bg-white font-medium text-black shadow-lg hover:bg-gray-100"
                        disabled={isGenerating}
                        onClick={openCreateModal}
                    >
                        + Create Habit
                    </Button>
                    <button
                        className="flex items-center justify-center gap-2 py-2 text-sm text-white/50 transition-colors hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isGenerating}
                        onClick={onGenerateExample}
                        title="Generate example habit"
                        type="button"
                    >
                        <RiSparklingLine className="h-4 w-4" />
                        {isGenerating ? "Generating..." : "Generate example"}
                    </button>
                </div>
            </div>
        </SpotlightCard>
    );
}
