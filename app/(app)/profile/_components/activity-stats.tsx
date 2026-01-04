"use client";

import {
    RiCalendarLine,
    RiStockLine,
    RiTargetLine,
    RiTrophyLine,
    RiVipCrownLine,
} from "@remixicon/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSubscription } from "@/hooks/use-subscription";
import { orpc } from "@/orpc/client";
import { ActivityStatsLoading } from "./activity-stats-loading";

export function ActivityStats() {
    const { data: stats, isLoading } = useSuspenseQuery(
        orpc.profile.getUserStats.queryOptions()
    );

    const { subscription, isTrial } = useSubscription();

    if (isLoading || !stats) {
        return <ActivityStatsLoading />;
    }

    const planName = subscription
        ? isTrial
            ? "Pro (Trial)"
            : "Pro"
        : "No Plan";

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Active Habits */}
            <div className="relative rounded-lg border border-white/10 bg-black/20 p-6">
                <div className="absolute top-4 right-4">
                    <RiTargetLine className="size-4 text-white/60" />
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
                    <RiStockLine className="size-4 text-white/60" />
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
                    <RiTrophyLine className="size-4 text-white/60" />
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
                    <RiCalendarLine className="h-4 w-4 text-white/60" />
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
                    <RiTargetLine className="size-4 text-white/60" />
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
                    <RiVipCrownLine className="size-4 text-white/60" />
                </div>
                <div>
                    <p className="mb-2 font-medium text-sm text-white/60">
                        Plan
                    </p>
                    <p className="font-bold text-2xl text-white">{planName}</p>
                </div>
            </div>
        </div>
    );
}
