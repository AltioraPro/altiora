"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { RANK_SYSTEM_DISPLAY, type RankInfo } from "./rank-system";

interface AllRanksListProps {
    currentRank: RankInfo;
    currentStreak: number;
}

export const AllRanksList = memo(function AllRanksList({
    currentRank,
    currentStreak,
}: AllRanksListProps) {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xs uppercase tracking-widest text-white/40">Progression Path</h3>
                <div className="text-[10px] text-white/30">Scroll for more</div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {RANK_SYSTEM_DISPLAY.map((rank) => {
                    const RankIcon = rank.icon;
                    const isCurrentRank = rank.name === currentRank.name;
                    const isUnlocked = currentStreak >= rank.minStreak;
                    const isLocked = !isUnlocked;

                    return (
                        <div
                            className={cn(
                                "group relative overflow-hidden border p-3 transition-all duration-300",
                                isCurrentRank
                                    ? "bg-white/5 border-white/20"
                                    : "bg-transparent border-transparent hover:bg-white/[0.02]",
                                isLocked && "opacity-40 grayscale"
                            )}
                            key={rank.name}
                        >
                            <div className="flex items-center gap-4">
                                {/* Left: Status Indicator */}
                                <div className={cn(
                                    "w-1 h-8",
                                    isCurrentRank ? "bg-white" : isUnlocked ? "bg-white/20" : "bg-white/5"
                                )} />

                                {/* Icon */}
                                <div className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center border",
                                    isCurrentRank
                                        ? "border-white/10 bg-black"
                                        : "border-white/5 bg-white/[0.02]"
                                )}>
                                    <RankIcon className={cn("h-4 w-4", isCurrentRank ? rank.color : "text-white/40")} />
                                </div>

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "text-sm font-bold tracking-tight",
                                            isCurrentRank ? "text-white" : "text-white/60"
                                        )}>
                                            {rank.name}
                                        </span>
                                        <span className="text-xs font-mono text-white/30">
                                            {rank.minStreak}d
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-white/40 truncate mt-0.5">
                                        {rank.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
