"use client";

import type { RankInfo } from "./rank-system";

interface NextRankProgressProps {
    nextRank: RankInfo;
    currentStreak: number;
    daysToNextRank: number;
}

export function NextRankProgress({
    nextRank,
    currentStreak,
    daysToNextRank,
}: NextRankProgressProps) {
    const progressPercentage = Math.min(
        (currentStreak / nextRank.minStreak) * 100,
        100
    );

    return (
        <div className="mb-4 bg-neutral-800/50 p-4">
            <h3 className="mb-3 font-bold text-lg">
                NEXT RANK: {nextRank.name}
            </h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Progress:</span>
                    <span className="text-white">
                        {currentStreak} / {nextRank.minStreak} days
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${nextRank.color.replace("text-", "bg-")}`}
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className="text-center">
                    <span className="text-sm text-white/60">
                        {daysToNextRank === 1
                            ? `Only 1 more consecutive day to become ${nextRank.name}`
                            : `Only ${daysToNextRank} more consecutive days to become ${nextRank.name}`}
                    </span>
                </div>
            </div>
        </div>
    );
}
