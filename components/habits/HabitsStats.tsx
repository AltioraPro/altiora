"use client";

import {
    Calendar,
    Crown,
    Info,
    Shield,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Trophy,
    X,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { HabitStatsOverview } from "@/server/routers/habits/types";
import { useHabits } from "./HabitsProvider";

interface HabitsStatsProps {
    data?: HabitStatsOverview;
    todayHabits?: Array<{ id: string; isCompleted: boolean }>;
}

interface RankInfo {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
    minStreak: number;
    description: string;
    discordRole: string;
    benefits: string[];
}

interface StatItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    suffix: string;
    color: string;
    showPulse?: boolean;
}

export function HabitsStats({ data, todayHabits }: HabitsStatsProps) {
    const { getOptimisticStats, optimisticUpdates } = useHabits();
    const [isRankModalOpen, setIsRankModalOpen] = useState(false);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isRankModalOpen) {
                setIsRankModalOpen(false);
            }
        };

        if (isRankModalOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isRankModalOpen]);

    const optimisticTodayHabits =
        todayHabits?.map((habit) => ({
            ...habit,
            isCompleted: optimisticUpdates[habit.id] ?? habit.isCompleted,
        })) ?? [];

    const todayCompletedHabits = optimisticTodayHabits.filter(
        (h) => h.isCompleted
    ).length;
    const todayTotalHabits = optimisticTodayHabits.length;
    const todayCompletionRate =
        todayTotalHabits > 0
            ? Math.round((todayCompletedHabits / todayTotalHabits) * 100)
            : 0;
    const willContinueStreak = todayCompletedHabits > 0;

    const optimisticData = getOptimisticStats(data, optimisticTodayHabits);

    const totalActiveHabits =
        optimisticData?.totalActiveHabits ?? todayTotalHabits;
    const averageCompletionRate =
        optimisticData?.averageCompletionRate ?? todayCompletionRate;
    const optimisticCurrentStreak =
        optimisticData?.currentStreak ?? (willContinueStreak ? 1 : 0);
    const longestStreak =
        optimisticData?.longestStreak ?? optimisticCurrentStreak;

    const rankSystem: RankInfo[] = [
        {
            name: "NEW",
            icon: Target,
            color: "text-white/40",
            bgColor: "bg-white/5",
            borderColor: "border-white/10",
            minStreak: 0,
            description: "Ready to start your personal transformation",
            discordRole: "New",
            benefits: ["Discord server access", "Community support"],
        },
        {
            name: "BEGINNER",
            icon: Target,
            color: "text-white/60",
            bgColor: "bg-white/5",
            borderColor: "border-white/20",
            minStreak: 1,
            description: "1+ day with at least one habit validated",
            discordRole: "Beginner",
            benefits: ["Access to basic channels", "Expert advice"],
        },
        {
            name: "RISING",
            icon: TrendingUp,
            color: "text-blue-400",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/30",
            minStreak: 3,
            description: "3+ consecutive days - Building momentum",
            discordRole: "Rising",
            benefits: ["Access to weekly challenges", "Special Discord badge"],
        },
        {
            name: "CHAMPION",
            icon: Trophy,
            color: "text-green-400",
            bgColor: "bg-green-500/10",
            borderColor: "border-green-500/30",
            minStreak: 7,
            description: "7+ consecutive days - Champion of daily discipline",
            discordRole: "Champion",
            benefits: [
                "Exclusive Discord role",
                "Access to private events",
                "Mentor other members",
            ],
        },
        {
            name: "EXPERT",
            icon: Star,
            color: "text-purple-400",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/30",
            minStreak: 14,
            description:
                "14+ consecutive days - Recognized productivity expert",
            discordRole: "Expert",
            benefits: [
                "VIP Discord role",
                "Access to masterclasses",
                "Ability to create challenges",
            ],
        },
        {
            name: "LEGEND",
            icon: Crown,
            color: "text-yellow-400",
            bgColor: "bg-yellow-500/10",
            borderColor: "border-yellow-500/30",
            minStreak: 30,
            description: "30+ consecutive days - Living legend of discipline",
            discordRole: "Legend",
            benefits: [
                "Legendary Discord role",
                "Exclusive access to all content",
                "Moderator status",
                "VIP event invitations",
            ],
        },
        {
            name: "MASTER",
            icon: Zap,
            color: "text-orange-400",
            bgColor: "bg-orange-500/10",
            borderColor: "border-orange-500/30",
            minStreak: 90,
            description:
                "90+ consecutive days - Master of consistency and discipline",
            discordRole: "Master",
            benefits: [
                "Master Discord role",
                "Exclusive masterclasses",
                "Personal coaching sessions",
                "Priority support",
                "Custom Discord badge",
            ],
        },
        {
            name: "GRANDMASTER",
            icon: Shield,
            color: "text-red-400",
            bgColor: "bg-red-500/10",
            borderColor: "border-red-500/30",
            minStreak: 180,
            description: "180+ consecutive days - Grand master of productivity",
            discordRole: "Grandmaster",
            benefits: [
                "Grandmaster Discord role",
                "Total access pass",
                "Personal mentor status",
                "Exclusive events",
                "Custom profile features",
                "Direct access to founders",
            ],
        },
        {
            name: "IMMORTAL",
            icon: Sparkles,
            color: "text-pink-400",
            bgColor: "bg-pink-500/10",
            borderColor: "border-pink-500/30",
            minStreak: 365,
            description:
                "365+ consecutive days - Immortal legend of excellence",
            discordRole: "Immortal",
            benefits: [
                "Immortal Discord role",
                "Legendary status",
                "All features",
                "Personal consultation",
                "Exclusive merchandise",
                "Founders circle access",
                "Custom integrations",
            ],
        },
    ];

    const currentRank =
        rankSystem.find((rank) => optimisticCurrentStreak >= rank.minStreak) ||
        rankSystem[0];
    const nextRank = rankSystem.find(
        (rank) => rank.minStreak > optimisticCurrentStreak
    );
    const daysToNextRank = nextRank
        ? nextRank.minStreak - optimisticCurrentStreak
        : 0;

    const stats: StatItem[] = [
        {
            icon: Target,
            label: "HABITS",
            value: totalActiveHabits,
            suffix: "",
            color: "text-white",
        },
        {
            icon: TrendingUp,
            label: "CURRENT SERIES",
            value: optimisticCurrentStreak,
            suffix: "d",
            color:
                optimisticCurrentStreak >= 7
                    ? "text-green-400"
                    : optimisticCurrentStreak >= 3
                      ? "text-white"
                      : "text-white/70",
            showPulse: willContinueStreak && optimisticCurrentStreak > 0,
        },
        {
            icon: Trophy,
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
            icon: Calendar,
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
    ];

    return (
        <>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xs">
                <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />

                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-bold text-lg tracking-tight">
                            STATISTICS
                        </h3>

                        <button
                            className={`flex items-center space-x-2 ${currentRank.bgColor} border ${currentRank.borderColor} group rounded-lg px-3 py-1 transition-all duration-200 hover:scale-105`}
                            onClick={() => setIsRankModalOpen(true)}
                            type="button"
                        >
                            <currentRank.icon
                                className={`h-4 w-4 ${currentRank.color} transition-transform group-hover:scale-110`}
                            />
                            <span className={`text-xs ${currentRank.color}`}>
                                {currentRank.name}
                            </span>
                            <Info className="h-3 w-3 animate-pulse text-white/40 transition-colors group-hover:text-white/60" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
                        {stats.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:bg-white/10"
                                    key={stat.label}
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <Icon className="h-5 w-5 text-white/60 transition-colors group-hover:text-white" />

                                        {/* Special indicators */}
                                        {stat.label === "CURRENT SERIES" &&
                                            (optimisticCurrentStreak >= 7 ||
                                                stat.showPulse) && (
                                                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                            )}
                                        {stat.label === "AVERAGE RATE" &&
                                            averageCompletionRate === 100 && (
                                                <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                                            )}
                                        {stat.label === "BEST SERIES" &&
                                            longestStreak >= 14 && (
                                                <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                                            )}
                                        {stat.label === "HABITS" &&
                                            totalActiveHabits >= 5 && (
                                                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                                            )}
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

                    {/* Quick Insights */}
                    <div className="mt-6 border-white/10 border-t pt-6">
                        <div className="space-y-3">
                            {optimisticCurrentStreak >= 7 && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                    <span className="text-green-400">
                                        {optimisticCurrentStreak >= 365
                                            ? `${optimisticCurrentStreak} days consecutive! Immortal consistency!`
                                            : optimisticCurrentStreak >= 180
                                              ? `${optimisticCurrentStreak} days consecutive! Grandmaster level!`
                                              : optimisticCurrentStreak >= 90
                                                ? `${optimisticCurrentStreak} days consecutive! Master level!`
                                                : optimisticCurrentStreak >= 30
                                                  ? `${optimisticCurrentStreak} days consecutive! Legendary consistency!`
                                                  : optimisticCurrentStreak >=
                                                      14
                                                    ? `${optimisticCurrentStreak} days consecutive! You're becoming an expert!`
                                                    : `${optimisticCurrentStreak} days consecutive! Excellent work!`}
                                    </span>
                                </div>
                            )}

                            {averageCompletionRate >= 80 && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                    <span className="text-green-400">
                                        Excellent completion rate! You&apos;re
                                        very consistent.
                                    </span>
                                </div>
                            )}

                            {optimisticCurrentStreak < 3 &&
                                totalActiveHabits > 0 && (
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-white/60" />
                                        <span className="text-white/60">
                                            Keep going! Validate at least one
                                            habit every day to build your
                                            streak.
                                        </span>
                                    </div>
                                )}

                            {optimisticCurrentStreak === 0 &&
                                totalActiveHabits > 0 && (
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-blue-400" />
                                        <span className="text-blue-400">
                                            Validate at least one habit today to
                                            start your streak!
                                        </span>
                                    </div>
                                )}

                            {/* Optimistic message for streak continuation */}
                            {willContinueStreak &&
                                optimisticCurrentStreak > 0 && (
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                        <span className="text-green-400">
                                            ✅ {todayCompletedHabits} validated
                                            - Your streak continues!
                                        </span>
                                    </div>
                                )}

                            {/* Rank-specific messages */}
                            {currentRank.name === "IMMORTAL" && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <Sparkles className="h-4 w-4 text-pink-400" />
                                    <span className="text-pink-400">
                                        You&apos;re an immortal legend! Your
                                        discipline transcends time.
                                    </span>
                                </div>
                            )}

                            {currentRank.name === "GRANDMASTER" && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <Shield className="h-4 w-4 text-red-400" />
                                    <span className="text-red-400">
                                        Grandmaster status! You&apos;re a master
                                        of life and productivity.
                                    </span>
                                </div>
                            )}

                            {currentRank.name === "MASTER" && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <Zap className="h-4 w-4 text-orange-400" />
                                    <span className="text-orange-400">
                                        Master level achieved! Your consistency
                                        is legendary.
                                    </span>
                                </div>
                            )}

                            {currentRank.name === "LEGEND" && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <Crown className="h-4 w-4 text-yellow-400" />
                                    <span className="text-yellow-400">
                                        You&apos;re a true legend! Your
                                        discipline is unmatched.
                                    </span>
                                </div>
                            )}

                            {currentRank.name === "EXPERT" && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <Star className="h-4 w-4 text-purple-400" />
                                    <span className="text-purple-400">
                                        Expert level achieved! You&apos;re
                                        mastering your habits.
                                    </span>
                                </div>
                            )}

                            {currentRank.name === "CHAMPION" && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <Trophy className="h-4 w-4 text-green-400" />
                                    <span className="text-green-400">
                                        Champion status! You&apos;re building
                                        lasting habits.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rank System Modal */}
            {isRankModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="font-bold text-2xl">
                                    RANK SYSTEM
                                </h2>
                                <button
                                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                                    onClick={() => setIsRankModalOpen(false)}
                                    type="button"
                                >
                                    <X className="h-5 w-5 text-white/60" />
                                </button>
                            </div>

                            {/* Current Rank Section */}
                            <div
                                className={`${currentRank.bgColor} border ${currentRank.borderColor} mb-6 rounded-xl p-4`}
                            >
                                <div className="mb-3 flex items-center space-x-3">
                                    <currentRank.icon
                                        className={`h-6 w-6 ${currentRank.color}`}
                                    />
                                    <h3
                                        className={`font-bold text-lg ${currentRank.color}`}
                                    >
                                        YOUR CURRENT RANK: {currentRank.name}
                                    </h3>
                                </div>
                                <p className="mb-3 text-sm text-white/80">
                                    {currentRank.description}
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <span className="text-white/60">
                                            Discord Role:
                                        </span>
                                        <span
                                            className={` ${currentRank.color}`}
                                        >
                                            {currentRank.discordRole}
                                        </span>
                                    </div>
                                    <div className="text-sm text-white/60">
                                        Benefits:
                                    </div>
                                    <ul className="ml-4 space-y-1">
                                        {currentRank.benefits.map(
                                            (benefit, index) => (
                                                <li
                                                    className="flex items-center space-x-2 text-sm text-white/80"
                                                    key={index}
                                                >
                                                    <div className="h-1 w-1 rounded-full bg-white/40" />
                                                    <span>{benefit}</span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Progress to Next Rank */}
                            {nextRank && (
                                <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                                    <h3 className="mb-3 font-bold text-lg">
                                        PROCHAIN RANK: {nextRank.name}
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/60">
                                                Progress:
                                            </span>
                                            <span className="text-white">
                                                {optimisticCurrentStreak} /{" "}
                                                {nextRank.minStreak} days
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-white/10">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${nextRank.color.replace("text-", "bg-")}`}
                                                style={{
                                                    width: `${Math.min((optimisticCurrentStreak / nextRank.minStreak) * 100, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-sm text-white/60">
                                                {daysToNextRank === 1
                                                    ? "Plus qu'1 jour consécutif pour devenir " +
                                                      nextRank.name
                                                    : `Plus que ${daysToNextRank} jours consécutifs pour devenir ${nextRank.name}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* All Ranks */}
                            <div>
                                <h3 className="mb-4 font-bold text-lg">
                                    ALL RANKS
                                </h3>
                                <div className="space-y-3">
                                    {rankSystem.map((rank) => {
                                        const RankIcon = rank.icon;
                                        const isCurrentRank =
                                            rank.name === currentRank.name;
                                        const isUnlocked =
                                            optimisticCurrentStreak >=
                                            rank.minStreak;

                                        return (
                                            <div
                                                className={cn(
                                                    "rounded-xl border p-4 transition-all duration-200",
                                                    isCurrentRank &&
                                                        `${rank.bgColor} ${rank.borderColor}`,
                                                    isUnlocked &&
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
                                                        {rank.minStreak > 1
                                                            ? "s"
                                                            : ""}
                                                    </span>
                                                </div>
                                                <p className="mb-2 text-sm text-white/80">
                                                    {rank.description}
                                                </p>
                                                <div className="text-white/60 text-xs">
                                                    Discord Role:{" "}
                                                    {rank.discordRole}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
