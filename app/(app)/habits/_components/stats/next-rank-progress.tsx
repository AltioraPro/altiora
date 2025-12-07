"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { RankInfo } from "./rank-system";

interface NextRankProgressProps {
    nextRank: RankInfo;
    currentStreak: number;
    daysToNextRank: number;
}

export const NextRankProgress = memo(function NextRankProgress({
    nextRank,
    currentStreak,
    daysToNextRank,
}: NextRankProgressProps) {
    const progressPercentage = useMemo(
        () => Math.min((currentStreak / nextRank.minStreak) * 100, 100),
        [currentStreak, nextRank.minStreak]
    );
    const NextRankIcon = nextRank.icon;

    return (
        <div className="relative overflow-hidden border border-white/10 bg-black/40 p-5">
            {/* Subtle gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />

            <div className="relative space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="mb-1 font-bold text-[10px] text-white/40 uppercase tracking-widest">
                            Next Target
                        </div>
                        <h3 className="flex items-center gap-2 font-bold text-lg text-white">
                            {nextRank.name}
                            <NextRankIcon
                                className={cn(
                                    "h-4 w-4 opacity-70",
                                    nextRank.color
                                )}
                            />
                        </h3>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-[10px] text-white/40 uppercase tracking-widest">
                            Progress
                        </div>
                        <div className="font-mono text-sm text-white/80">
                            {currentStreak}
                            <span className="text-white/30">/</span>
                            {nextRank.minStreak}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-4">
                    {/* Progress bar container */}
                    <div className="relative h-1.5 w-full overflow-hidden bg-white/5">
                        {/* Animated progress fill */}
                        <div
                            className={cn(
                                "h-full transition-all duration-700 ease-out",
                                "bg-white",
                                "shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                            )}
                            style={{
                                width: `${progressPercentage}%`,
                            }}
                        />
                    </div>

                    {/* Days remaining message */}
                    <p className="text-center font-medium text-white/50 text-xs">
                        {daysToNextRank === 1 ? (
                            <>
                                <span className="text-white">1 day</span> left
                            </>
                        ) : (
                            <>
                                <span className="text-white">
                                    {daysToNextRank} days
                                </span>{" "}
                                left
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
});
