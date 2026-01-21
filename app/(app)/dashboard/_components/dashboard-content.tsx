"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { orpc } from "@/orpc/client";
import { DashboardGrid } from "./dashboard-grid";

export function DashboardContent() {
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
            />
            <div className="mt-8">
                <DiscordWelcomeChecker />
            </div>
        </div>
    );
}
