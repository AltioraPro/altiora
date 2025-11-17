import { LeaderboardPeriodFilter } from "./leaderboard-period-filter";

export function LeaderboardHeader() {
    return (
        <div className="relative mb-8 border-white/10 border-b">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent" />
            <div className="relative mx-auto max-w-7xl px-6 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-argesta font-bold text-3xl tracking-tight">
                            Leaderboard
                        </h1>
                        <p className="mt-2 text-sm text-white/60">
                            Top performers ranked by total deep work hours.
                        </p>
                    </div>

                    <LeaderboardPeriodFilter />
                </div>
            </div>
        </div>
    );
}

