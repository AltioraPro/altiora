"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useCustomer } from "autumn-js/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/orpc/client";
import { ActivityStatsLoading } from "./activity-stats-loading";

export function ActivityStats() {
    const { data: stats, isLoading } = useSuspenseQuery(
        orpc.profile.getUserStats.queryOptions()
    );

    const { customer } = useCustomer();

    if (isLoading || !stats) {
        return <ActivityStatsLoading />;
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Active Habits */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Habits</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-bold text-3xl text-white">
                        {stats.habits.active}
                    </p>
                </CardContent>
            </Card>

            {/* Trading Entries */}
            <Card>
                <CardHeader>
                    <CardTitle>Trading Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-bold text-3xl text-white">
                        {stats.trades.total}
                    </p>
                </CardContent>
            </Card>

            {/* Current Rank */}
            <Card className="relative">
                <CardHeader>
                    <CardTitle>Current Rank</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-bold text-2xl text-white">
                        {stats.user.rank as string}
                    </p>
                </CardContent>
            </Card>

            {/* Days Since Registration */}
            <Card className="relative">
                <CardHeader>
                    <CardTitle>Days Active</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-bold text-3xl text-white">
                        {stats.user.daysSinceRegistration}
                    </p>
                </CardContent>
            </Card>

            {/* Total Habits Created */}
            <Card className="relative">
                <CardHeader>
                    <CardTitle>Total Habits</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-bold text-3xl text-white">
                        {stats.habits.total}
                    </p>
                </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card className="relative">
                <CardHeader>
                    <CardTitle>Plan</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-bold text-2xl text-white">
                        {customer?.products[0]?.name}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
