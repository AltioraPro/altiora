"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { GlobalTradingCharts } from "@/components/trading/GlobalTradingCharts";
import { GlobalTradingStats } from "@/components/trading/GlobalTradingStats";
import { orpc } from "@/orpc/client";
import { dashboardSearchParams } from "../search-params";

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

    const { data: stats } = useSuspenseQuery(
        orpc.trading.getStats.queryOptions({ input: queryInput })
    );

    const { data: sessions } = useSuspenseQuery(
        orpc.trading.getSessions.queryOptions({ input: queryInput })
    );

    const { data: trades } = useSuspenseQuery(
        orpc.trading.getTrades.queryOptions({ input: queryInput })
    );

    return (
        <>
            {stats && <GlobalTradingStats className="mb-8" stats={stats} />}

            {/* Charts */}
            {stats && sessions && trades && (
                <div className="mb-8">
                    <div>
                        <div className="mb-4 flex flex-col items-start justify-between">
                            <h2 className="font-bold text-2xl text-white">
                                Performance Charts
                            </h2>
                            <p className="text-sm text-white/60">
                                Visual analysis of your overall performance.
                            </p>
                        </div>
                        <GlobalTradingCharts
                            sessions={sessions}
                            trades={trades}
                        />
                    </div>
                </div>
            )}

            <DiscordWelcomeChecker />
        </>
    );
}
