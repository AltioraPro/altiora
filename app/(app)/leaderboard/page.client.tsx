"use client";

import { LeaderboardBackground } from "./_components/leaderboard-background";
import { LeaderboardHeader } from "./_components/leaderboard-header";
import { LeaderboardList } from "./_components/leaderboard-list";

export function LeaderboardPageClient() {
    return (
        <div className="mb-20 min-h-screen">
            <div className="relative mx-auto w-full">
                <LeaderboardHeader />

                <div className="mx-auto max-w-7xl px-6">
                    <LeaderboardList />
                </div>
            </div>

            <LeaderboardBackground />
        </div>
    );
}
