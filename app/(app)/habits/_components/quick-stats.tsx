"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";
import { useHabits } from "./habits-provider";

export function QuickStats() {
    const { getOptimisticTodayStats, getOptimisticStats } = useHabits();

    const { data: dashboardData, isLoading } = useQuery(
        orpc.habits.getDashboard.queryOptions({
            input: {
                viewMode: "today",
            },
        })
    );

    const optimisticTodayStats = getOptimisticTodayStats(
        dashboardData?.todayStats
    );

    const optimisticStats = getOptimisticStats(
        dashboardData?.stats,
        dashboardData?.todayStats.habits
    );

    const todayCompleted = optimisticTodayStats?.completedHabits ?? 0;
    const todayTotal = optimisticTodayStats?.totalHabits ?? 0;
    const currentStreak = optimisticStats?.currentStreak ?? 0;

    if (isLoading) {
        return (
            <div className="hidden items-center space-x-6 md:flex">
                <div className="text-center">
                    <div className="font-bold text-2xl">
                        <span className="bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
                            --
                        </span>
                    </div>
                    <div className="text-white/50 text-xs">Today</div>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center">
                    <div className="font-bold text-2xl">
                        <span className="bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
                            --
                        </span>
                    </div>
                    <div className="text-white/50 text-xs">SÉRIE</div>
                </div>
            </div>
        );
    }

    return (
        <div className="hidden items-center space-x-6 md:flex">
            <div className="text-center">
                <div className="font-bold text-2xl">
                    <span className="bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
                        {todayTotal > 0
                            ? `${todayCompleted}/${todayTotal}`
                            : "--"}
                    </span>
                </div>
                <div className="text-white/50 text-xs">Today</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
                <div className="font-bold text-2xl">
                    <span className="bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
                        {currentStreak > 0 ? currentStreak : "--"}
                    </span>
                </div>
                <div className="text-white/50 text-xs">SÉRIE</div>
            </div>
        </div>
    );
}
