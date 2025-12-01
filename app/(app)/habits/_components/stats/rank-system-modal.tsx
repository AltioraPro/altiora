"use client";

import { memo, useCallback, useEffect, useMemo } from "react";
import { RiCloseLine } from "@remixicon/react";
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

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    // Escape key handler at document level for reliability
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        // Prevent body scroll when modal is open
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rank-system-title"
        >
            {/* Overlay avec backdrop blur */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200" />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-5xl overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
                {/* Gradient accent line */}
                <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 bg-[#0A0A0A] px-6 py-4">
                    <h2
                        id="rank-system-title"
                        className="font-bold text-lg tracking-tight text-white"
                    >
                        RANK SYSTEM
                    </h2>
                    <button
                        className="group flex h-8 w-8 items-center justify-center border border-white/10 bg-transparent transition-all duration-200 hover:border-white/30 hover:bg-white/5"
                        onClick={onClose}
                        type="button"
                        aria-label="Fermer la modal"
                    >
                        <RiCloseLine className="size-4 text-white/40 transition-colors group-hover:text-white" />
                    </button>
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
            </div>
        </div>
    );
}

export const RankSystemModal = memo(RankSystemModalComponent);
