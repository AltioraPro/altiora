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
        <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-white/40 text-xs uppercase tracking-widest">
                    Progression Path
                </h3>
                <div className="text-[10px] text-white/30">Scroll for more</div>
            </div>

            <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto pr-2">
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
                                    ? "border-white/20 bg-white/5"
                                    : "border-transparent bg-transparent hover:bg-white/[0.02]",
                                isLocked && "opacity-40 grayscale"
                            )}
                            key={rank.name}
                        >
                            <div className="flex items-center gap-4">
                                {/* Left: Status Indicator */}
                                <div
                                    className={cn(
                                        "h-8 w-1",
                                        (() => {
                                            if (isCurrentRank) {
                                                return "bg-white";
                                            }
                                            if (isUnlocked) {
                                                return "bg-white/20";
                                            }
                                            return "bg-white/5";
                                        })()
                                    )}
                                />

                                {/* Icon */}
                                <div
                                    className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center border",
                                        isCurrentRank
                                            ? "border-white/10 bg-black"
                                            : "border-white/5 bg-white/[0.02]"
                                    )}
                                >
                                    <RankIcon
                                        className={cn(
                                            "h-4 w-4",
                                            isCurrentRank
                                                ? rank.color
                                                : "text-white/40"
                                        )}
                                    />
                                </div>

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={cn(
                                                "font-bold text-sm tracking-tight",
                                                isCurrentRank
                                                    ? "text-white"
                                                    : "text-white/60"
                                            )}
                                        >
                                            {rank.name}
                                        </span>
                                        <span className="font-mono text-white/30 text-xs">
                                            {rank.minStreak}d
                                        </span>
                                    </div>
                                    <p className="mt-0.5 truncate text-[11px] text-white/40">
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
