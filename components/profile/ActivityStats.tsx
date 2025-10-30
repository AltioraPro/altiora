"use client";

import { Calendar, Crown, Target, TrendingUp, Trophy } from "lucide-react";
import { api } from "@/trpc/client";

export function ActivityStats() {
    const { data: stats, isLoading } = api.profile.getUserStats.useQuery();

    if (isLoading || !stats) {
        return (
            <div className="space-y-8">
                {/* General Stats Skeleton */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {new Array(6).map((_, i) => (
                        <div
                            className="animate-pulse rounded-lg bg-black/20 p-6"
                            key={i}
                        >
                            <div className="mb-3 h-6 rounded bg-white/10" />
                            <div className="mb-2 h-8 rounded bg-white/10" />
                            <div className="h-4 rounded bg-white/10" />
                        </div>
                    ))}
                </div>

                {/* Pomodoro Section Skeleton */}
                <div className="animate-pulse rounded-xl border border-white/20 bg-black/40">
                    <div className="mb-6 flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-white/10" />
                        <div className="flex-1">
                            <div className="mb-2 h-5 w-32 rounded bg-white/10" />
                            <div className="h-3 w-48 rounded bg-white/10" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {new Array(3).map((_, i) => (
                            <div
                                className="rounded-lg border border-white/10 bg-white/5 p-5"
                                key={i}
                            >
                                <div className="mb-3 h-8 rounded bg-white/10" />
                                <div className="mb-2 h-8 rounded bg-white/10" />
                                <div className="h-4 w-20 rounded bg-white/10" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Active Habits */}
            <div className="relative rounded-lg border border-white/10 bg-black/20 p-6">
                <div className="absolute top-4 right-4">
                    <Target className="h-4 w-4 text-white/60" />
                </div>
                <div>
                    <p className="mb-2 font-medium text-sm text-white/60">
                        Active Habits
                    </p>
                    <p className="font-bold text-3xl text-white">
                        {stats.habits.active}
                    </p>
                </div>
            </div>

            {/* Trading Entries */}
            <div className="relative rounded-lg border border-white/10 bg-black/20 p-6">
                <div className="absolute top-4 right-4">
                    <TrendingUp className="h-4 w-4 text-white/60" />
                </div>
                <div>
                    <p className="mb-2 font-medium text-sm text-white/60">
                        Trading Entries
                    </p>
                    <p className="font-bold text-3xl text-white">
                        {stats.trades.total}
                    </p>
                </div>
            </div>

            {/* Current Rank */}
            <div className="relative rounded-lg border border-white/10 bg-black/20 p-6">
                <div className="absolute top-4 right-4">
                    <Trophy className="h-4 w-4 text-white/60" />
                </div>
                <div>
                    <p className="mb-2 font-medium text-sm text-white/60">
                        Current Rank
                    </p>
                    <p className="font-bold text-2xl text-white">
                        {stats.user.rank as string}
                    </p>
                </div>
            </div>

            {/* Days Since Registration */}
            <div className="relative rounded-lg border border-white/10 bg-black/20 p-6">
                <div className="absolute top-4 right-4">
                    <Calendar className="h-4 w-4 text-white/60" />
                </div>
                <div>
                    <p className="mb-2 font-medium text-sm text-white/60">
                        Days Active
                    </p>
                    <p className="font-bold text-3xl text-white">
                        {stats.user.daysSinceRegistration}
                    </p>
                </div>
            </div>

            {/* Total Habits Created */}
            <div className="relative rounded-lg border border-white/10 bg-black/20 p-6">
                <div className="absolute top-4 right-4">
                    <Target className="h-4 w-4 text-white/60" />
                </div>
                <div>
                    <p className="mb-2 font-medium text-sm text-white/60">
                        Total Habits
                    </p>
                    <p className="font-bold text-3xl text-white">
                        {stats.habits.total}
                    </p>
                </div>
            </div>

            {/* Subscription Status */}
            <div className="relative rounded-lg border border-white/10 bg-black/20 p-6">
                <div className="absolute top-4 right-4">
                    <Crown className="h-4 w-4 text-white/60" />
                </div>
                <div>
                    <p className="mb-2 font-medium text-sm text-white/60">
                        Plan
                    </p>
                    {/* <p
                        className={`font-bold text-2xl ${stats.user.subscriptionPlan === "PRO" ? "text-white" : "text-white/60"}`}
                    >
                        {stats.user.subscriptionPlan}
                    </p> */}
                </div>
            </div>
        </div>
    );
}
