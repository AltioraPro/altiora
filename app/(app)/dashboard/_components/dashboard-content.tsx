"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";

import { orpc } from "@/orpc/client";
import { dashboardSearchParams } from "../search-params";
import { DashboardGrid } from "./dashboard-grid";

export function DashboardContent() {
    const [journalIds] = useQueryState(
        "journalIds",
        dashboardSearchParams.journalIds
    );

    const queryInput = useMemo(() => {
        if (!journalIds || journalIds.length === 0) {
            return {};
        }
        if (journalIds.length === 1) {
            return { journalId: journalIds[0] };
        }
        return { journalIds };
    }, [journalIds]);

    // Trading Data
    const { data: stats } = useSuspenseQuery(
        orpc.trading.getStats.queryOptions({ input: queryInput })
    );

    const { data: trades } = useSuspenseQuery(
        orpc.trading.getTrades.queryOptions({ input: queryInput })
    );

    // Habits Data (Global - week view for better stats)
    const { data: habitsDashboard } = useSuspenseQuery(
        orpc.habits.getDashboard.queryOptions({ input: { viewMode: "week" } })
    );

    // Goals Data (Global)
    const { data: goals } = useSuspenseQuery(
        orpc.goals.getAll.queryOptions({ input: undefined })
    );

    // Profile Stats (Deepwork, Pomodoro, User stats)
    const { data: profileStats } = useSuspenseQuery(
        orpc.profile.getUserStats.queryOptions({ input: undefined })
    );

    return (
        <div className="mx-auto w-full max-w-[1600px]">
            <DashboardGrid
                goals={goals}
                habitsDashboard={habitsDashboard}
                profileStats={profileStats}
                stats={stats}
                trades={trades}
            />
            <div className="mt-8">
                <DiscordWelcomeChecker />
            </div>
        </div>
    );
}
