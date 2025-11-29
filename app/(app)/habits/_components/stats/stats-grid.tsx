"use client";

import { memo } from "react";

interface StatItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    suffix: string;
    color: string;
    showPulse?: boolean;
}

interface StatsGridProps {
    stats: StatItem[];
    averageCompletionRate: number;
    longestStreak: number;
    totalActiveHabits: number;
}

function StatsGridComponent({
    stats,
    averageCompletionRate,
    longestStreak,
    totalActiveHabits,
}: StatsGridProps) {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <div
                        className="group border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:bg-white/10"
                        key={stat.label}
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <Icon className="h-5 w-5 text-white/60 transition-colors group-hover:text-white" />

                            <StatIndicator
                                averageCompletionRate={averageCompletionRate}
                                label={stat.label}
                                longestStreak={longestStreak}
                                showPulse={stat.showPulse}
                                totalActiveHabits={totalActiveHabits}
                            />
                        </div>

                        <div className="space-y-1">
                            <div
                                className={`font-bold text-2xl ${stat.color} transition-colors`}
                            >
                                {stat.value}
                                {stat.suffix}
                            </div>
                            <div className="text-white/60 text-xs">
                                {stat.label}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

interface StatIndicatorProps {
    label: string;
    showPulse?: boolean;
    averageCompletionRate: number;
    longestStreak: number;
    totalActiveHabits: number;
}

function StatIndicator({
    label,
    showPulse,
    averageCompletionRate,
    longestStreak,
    totalActiveHabits,
}: StatIndicatorProps) {
    if (label === "CURRENT SERIES" && showPulse) {
        return (
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
        );
    }

    if (label === "AVERAGE RATE" && averageCompletionRate === 100) {
        return (
            <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
        );
    }

    if (label === "BEST SERIES" && longestStreak >= 14) {
        return (
            <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
        );
    }

    if (label === "HABITS" && totalActiveHabits >= 5) {
        return (
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
        );
    }

    return null;
}

export const StatsGrid = memo(StatsGridComponent);
