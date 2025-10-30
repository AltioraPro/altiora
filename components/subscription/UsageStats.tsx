"use client";

import { BarChart3, BookOpen, Crown, Target, Trophy } from "lucide-react";

export function UsageStats() {
    const fallbackData = {
        limits: {
            maxHabits: 3,
            maxTradingEntries: 10,
            maxAnnualGoals: 1,
            maxQuarterlyGoals: 1,
            maxMonthlyGoals: 0,
        },
        usage: {
            currentHabits: 0,
            monthlyTradingEntries: 0,
            currentAnnualGoals: 0,
            currentQuarterlyGoals: 0,
            currentMonthlyGoals: 0,
        },
    };

    const getUsagePercentage = (current: number, max: number) => {
        if (max >= 999_999) {
            return 0;
        }
        if (max === 0) {
            return 0;
        }
        return Math.min((current / max) * 100, 100);
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) {
            return "text-red-400";
        }
        if (percentage >= 75) {
            return "text-amber-400";
        }
        return "text-green-400";
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) {
            return "bg-red-500";
        }
        if (percentage >= 75) {
            return "bg-amber-500";
        }
        return "bg-green-500";
    };

    const getPlanName = () => {
        if (
            fallbackData.limits.maxHabits === 3 &&
            fallbackData.limits.maxTradingEntries === 10
        ) {
            return "Free Plan";
        }
        if (fallbackData.limits.maxHabits >= 999_999) {
            return "Altiorans";
        }
        return "Custom Plan";
    };

    // if (isLoading) {
    //     return (
    //         <div className="space-y-6">
    //             <div className="mb-4 flex items-center space-x-3">
    //                 <BarChart3 className="h-5 w-5 text-white/60" />
    //                 <h3 className="font-bold text-lg text-white tracking-wide">
    //                     PLAN USAGE
    //                 </h3>
    //             </div>
    //             <div className="space-y-4">
    //                 {[1, 2, 3].map((i) => (
    //                     <div
    //                         className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-4"
    //                         key={i}
    //                     >
    //                         <div className="mb-3 h-4 rounded bg-white/10" />
    //                         <div className="h-2 rounded bg-white/10" />
    //                     </div>
    //                 ))}
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="space-y-6">
            <div className="mb-4 flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-white/60" />
                <h3 className="font-bold text-lg text-white tracking-wide">
                    PLAN USAGE
                </h3>
                {/* {error && (
                    <span className="rounded bg-red-500/10 px-2 py-1 text-red-400 text-xs">
                        Offline
                    </span>
                )} */}
            </div>

            <div className="space-y-4">
                {/* Habits */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Target className="h-5 w-5 text-white/60" />
                            <span className="text-sm text-white/80 tracking-wide">
                                HABITS
                            </span>
                        </div>
                        <span
                            className={`font-bold text-sm ${getUsageColor(getUsagePercentage(fallbackData.usage.currentHabits, fallbackData.limits.maxHabits))}`}
                        >
                            {fallbackData.usage.currentHabits}/
                            {fallbackData.limits.maxHabits < 999_999
                                ? fallbackData.limits.maxHabits
                                : "∞"}
                        </span>
                    </div>

                    {fallbackData.limits.maxHabits > 0 && (
                        <div className="h-2 w-full rounded-full bg-white/10">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(getUsagePercentage(fallbackData.usage.currentHabits, fallbackData.limits.maxHabits))}`}
                                style={{
                                    width: `${getUsagePercentage(fallbackData.usage.currentHabits, fallbackData.limits.maxHabits)}%`,
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Trading Entries */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <BookOpen className="h-5 w-5 text-white/60" />
                            <span className="text-sm text-white/80 tracking-wide">
                                TRADING ENTRIES
                            </span>
                        </div>
                        <span
                            className={`font-bold text-sm ${getUsageColor(getUsagePercentage(fallbackData.usage.monthlyTradingEntries, fallbackData.limits.maxTradingEntries))}`}
                        >
                            {fallbackData.usage.monthlyTradingEntries}/
                            {fallbackData.limits.maxTradingEntries < 999_999
                                ? fallbackData.limits.maxTradingEntries
                                : "∞"}
                        </span>
                    </div>

                    {fallbackData.limits.maxTradingEntries > 0 && (
                        <div className="h-2 w-full rounded-full bg-white/10">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(getUsagePercentage(fallbackData.usage.monthlyTradingEntries, fallbackData.limits.maxTradingEntries))}`}
                                style={{
                                    width: `${getUsagePercentage(fallbackData.usage.monthlyTradingEntries, fallbackData.limits.maxTradingEntries)}%`,
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Goals */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Trophy className="h-5 w-5 text-white/60" />
                            <span className="text-sm text-white/80 tracking-wide">
                                GOALS
                            </span>
                        </div>
                        <span
                            className={`font-bold text-sm ${getUsageColor(getUsagePercentage(fallbackData.usage.currentAnnualGoals + fallbackData.usage.currentQuarterlyGoals, fallbackData.limits.maxAnnualGoals + fallbackData.limits.maxQuarterlyGoals))}`}
                        >
                            {fallbackData.usage.currentAnnualGoals +
                                fallbackData.usage.currentQuarterlyGoals}
                            /
                            {fallbackData.limits.maxAnnualGoals +
                                fallbackData.limits.maxQuarterlyGoals <
                            999_999
                                ? "∞"
                                : fallbackData.limits.maxAnnualGoals +
                                  fallbackData.limits.maxQuarterlyGoals}
                        </span>
                    </div>

                    {fallbackData.limits.maxAnnualGoals +
                        fallbackData.limits.maxQuarterlyGoals >
                        0 && (
                        <div className="h-2 w-full rounded-full bg-white/10">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(getUsagePercentage(fallbackData.usage.currentAnnualGoals + fallbackData.usage.currentQuarterlyGoals, fallbackData.limits.maxAnnualGoals + fallbackData.limits.maxQuarterlyGoals))}`}
                                style={{
                                    width: `${getUsagePercentage(fallbackData.usage.currentAnnualGoals + fallbackData.usage.currentQuarterlyGoals, fallbackData.limits.maxAnnualGoals + fallbackData.limits.maxQuarterlyGoals)}%`,
                                }}
                            />
                        </div>
                    )}

                    <div className="mt-2 flex justify-between text-white/60 text-xs">
                        <span>
                            Annual: {fallbackData.usage.currentAnnualGoals}/
                            {fallbackData.limits.maxAnnualGoals < 999_999
                                ? fallbackData.limits.maxAnnualGoals
                                : "∞"}
                        </span>
                        <span>
                            Quarterly:{" "}
                            {fallbackData.usage.currentQuarterlyGoals}/
                            {fallbackData.limits.maxQuarterlyGoals < 999_999
                                ? fallbackData.limits.maxQuarterlyGoals
                                : "∞"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Current Plan */}
            <div className="rounded-xl border border-white/20 bg-gradient-to-r from-white/5 to-white/10 p-4">
                <div className="mb-2 flex items-center space-x-3">
                    <Crown className="h-5 w-5 text-white/60" />
                    <span className="font-bold text-sm text-white tracking-wide">
                        CURRENT PLAN
                    </span>
                </div>
                <p className="text-sm text-white/80">{getPlanName()}</p>
            </div>
        </div>
    );
}
