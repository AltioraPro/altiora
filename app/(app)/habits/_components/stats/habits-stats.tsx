"use client";

import {
    RiCalendarLine,
    RiInformationLine,
    RiStockLine,
    RiTargetLine,
    RiTrophyLine,
} from "@remixicon/react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { HabitStatsOverview } from "@/server/routers/habits/types";
import { useHabits } from "../habits-provider";
import { getCurrentRank, getNextRank } from "./rank-system";
import { RankSystemModal } from "./rank-system-modal";
import { StatsGrid } from "./stats-grid";

interface HabitsStatsProps {
    data?: HabitStatsOverview;
    todayHabits?: Array<{ id: string; isCompleted: boolean }>;
}

export function HabitsStats({ data, todayHabits }: HabitsStatsProps) {
    const { getOptimisticStats, optimisticUpdates } = useHabits();
    const [isRankModalOpen, setIsRankModalOpen] = useState(false);

    // Apply optimistic updates to today's habits
    const optimisticTodayHabits = useMemo(
        () =>
            todayHabits?.map((habit) => ({
                ...habit,
                isCompleted: optimisticUpdates[habit.id] ?? habit.isCompleted,
            })) ?? [],
        [todayHabits, optimisticUpdates]
    );

    // Calculate today's completion stats
    const todayStats = useMemo(() => {
        const completed = optimisticTodayHabits.filter(
            (h) => h.isCompleted
        ).length;
        const total = optimisticTodayHabits.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const willContinue = completed > 0;

        return { completed, total, rate, willContinue };
    }, [optimisticTodayHabits]);

    // Get optimistic data with streak calculations
    const optimisticData = getOptimisticStats(data, optimisticTodayHabits);

    // Extract stats values with fallbacks
    const totalActiveHabits =
        optimisticData?.totalActiveHabits ?? todayStats.total;
    const averageCompletionRate =
        optimisticData?.averageCompletionRate ?? todayStats.rate;
    const currentStreak =
        optimisticData?.currentStreak ?? (todayStats.willContinue ? 1 : 0);
    const longestStreak = optimisticData?.longestStreak ?? currentStreak;

    // Calculate rank info using the fixed logic
    const currentRank = getCurrentRank(currentStreak);
    const nextRank = getNextRank(currentStreak);

    // Memoize stats array to prevent recreation on every render
    const stats = useMemo(
        () => [
            {
                icon: RiTargetLine,
                label: "HABITS",
                value: totalActiveHabits,
                suffix: "",
                color: "text-white",
            },
            {
                icon: RiStockLine,
                label: "CURRENT SERIES",
                value: currentStreak,
                suffix: "d",
                color:
                    currentStreak >= 7
                        ? "text-green-400"
                        : currentStreak >= 3
                          ? "text-white"
                          : "text-white/70",
                showPulse: todayStats.willContinue && currentStreak > 0,
            },
            {
                icon: RiTrophyLine,
                label: "BEST SERIES",
                value: longestStreak,
                suffix: "d",
                color:
                    longestStreak >= 14
                        ? "text-yellow-400"
                        : longestStreak >= 7
                          ? "text-green-400"
                          : "text-white",
            },
            {
                icon: RiCalendarLine,
                label: "AVERAGE RATE",
                value: averageCompletionRate,
                suffix: "%",
                color:
                    averageCompletionRate >= 80
                        ? "text-green-400"
                        : averageCompletionRate >= 60
                          ? "text-white"
                          : "text-white/70",
            },
        ],
        [
            totalActiveHabits,
            currentStreak,
            longestStreak,
            averageCompletionRate,
            todayStats.willContinue,
        ]
    );

    return (
        <>
            <div className="relative overflow-hidden border border-neutral-800 bg-neutral-900 p-6">
                {/* Header with Rank Badge */}
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-bold text-lg tracking-tight">
                        STATISTICS
                    </h3>

                    <button
                        aria-label="View rank system details"
                        className={`flex items-center space-x-2 ${currentRank.bgColor} border ${currentRank.borderColor} group px-3 py-1 transition-all duration-200 hover:scale-105`}
                        onClick={() => setIsRankModalOpen(true)}
                        type="button"
                    >
                        <currentRank.icon
                            className={cn(
                                "h-4 w-4",
                                "transition-transform group-hover:scale-110",
                                currentRank.color
                            )}
                        />
                        <span className={cn("text-xs", currentRank.color)}>
                            {currentRank.name}
                        </span>
                        <RiInformationLine className="size-3 animate-pulse text-white/40 transition-colors group-hover:text-white/60" />
                    </button>
                </div>

                <StatsGrid
                    averageCompletionRate={averageCompletionRate}
                    longestStreak={longestStreak}
                    stats={stats}
                    totalActiveHabits={totalActiveHabits}
                />
            </div>

            <RankSystemModal
                currentRank={currentRank}
                currentStreak={currentStreak}
                isOpen={isRankModalOpen}
                nextRank={nextRank}
                onClose={() => setIsRankModalOpen(false)}
            />
        </>
    );
}
