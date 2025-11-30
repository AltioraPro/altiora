"use client";

import { cn } from "@/lib/utils";
import { RANK_SYSTEM_DISPLAY, type RankInfo } from "./rank-system";

interface AllRanksListProps {
    currentRank: RankInfo;
    currentStreak: number;
}

export function AllRanksList({
    currentRank,
    currentStreak,
}: AllRanksListProps) {
    return (
        <div>
            <h3 className="mb-4 font-bold text-lg">ALL RANKS</h3>
            <div className="space-y-2.5">
                {RANK_SYSTEM_DISPLAY.map((rank) => {
                    const RankIcon = rank.icon;
                    const isCurrentRank = rank.name === currentRank.name;
                    const isUnlocked = currentStreak >= rank.minStreak;

                    return (
                        <div
                            className={cn(
                                "border p-4 transition-all duration-200",
                                isCurrentRank &&
                                    `${rank.bgColor} ${rank.borderColor}`,
                                isUnlocked &&
                                    !isCurrentRank &&
                                    "border-white/20 bg-white/5",
                                !isUnlocked &&
                                    "border-white/10 bg-white/5 opacity-50"
                            )}
                            key={rank.name}
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <RankIcon
                                        className={`h-5 w-5 ${rank.color}`}
                                    />
                                    <span
                                        className={`font-medium ${rank.color}`}
                                    >
                                        {rank.name}
                                    </span>
                                    {isCurrentRank && (
                                        <span className="rounded bg-white/20 px-2 py-1 text-white text-xs">
                                            CURRENT
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm text-white/60">
                                    {rank.minStreak} day
                                    {rank.minStreak !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <p className="mb-2 text-sm text-white/80">
                                {rank.description}
                            </p>
                            <div className="text-white/60 text-xs">
                                Discord Role: {rank.discordRole}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
