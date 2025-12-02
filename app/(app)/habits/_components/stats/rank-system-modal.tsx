"use client";

import { memo, useMemo } from "react";
import { RiCloseLine } from "@remixicon/react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { AllRanksList } from "./all-ranks-list";
import { CurrentRankCard } from "./current-rank-card";
import { NextRankProgress } from "./next-rank-progress";
import { getDaysToNextRank, type RankInfo } from "./rank-system";

interface RankSystemModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentRank: RankInfo;
    nextRank: RankInfo | undefined;
    currentStreak: number;
}

function RankSystemModalComponent({
    isOpen,
    onClose,
    currentRank,
    nextRank,
    currentStreak,
}: RankSystemModalProps) {
    const daysToNextRank = useMemo(
        () => getDaysToNextRank(currentStreak, nextRank),
        [currentStreak, nextRank]
    );

    return (
        <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
            <DialogContent
                className="top-[50%] left-[50%] w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] overflow-hidden border border-white/10 bg-[#0A0A0A] p-0 shadow-2xl"
                overlayClassName="bg-black/50 backdrop-blur-sm"
                showCloseButton={false}
            >
                {/* Gradient accent line */}
                <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 bg-[#0A0A0A] px-6 py-4">
                    <DialogTitle className="font-bold text-lg tracking-tight text-white">
                        RANK SYSTEM
                    </DialogTitle>
                    <DialogClose className="group flex h-8 w-8 items-center justify-center border border-white/10 bg-transparent transition-all duration-200 hover:border-white/30 hover:bg-white/5">
                        <RiCloseLine className="size-4 text-white/40 transition-colors group-hover:text-white" />
                        <span className="sr-only">Fermer</span>
                    </DialogClose>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 h-[600px]">
                    {/* Left Column: Current & Next Rank */}
                    <div className="md:col-span-5 flex flex-col gap-4 p-6 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 overflow-y-auto">
                        <div className="flex-1 flex flex-col gap-4">
                            <CurrentRankCard rank={currentRank} />

                            {nextRank && (
                                <NextRankProgress
                                    currentStreak={currentStreak}
                                    daysToNextRank={daysToNextRank}
                                    nextRank={nextRank}
                                />
                            )}
                        </div>
                    </div>

                    {/* Right Column: All Ranks List */}
                    <div className="md:col-span-7 bg-[#0A0A0A] overflow-hidden flex flex-col">
                        <div className="p-6 h-full overflow-hidden">
                            <AllRanksList
                                currentRank={currentRank}
                                currentStreak={currentStreak}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export const RankSystemModal = memo(RankSystemModalComponent);
