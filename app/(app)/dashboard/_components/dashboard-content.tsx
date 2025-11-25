"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { GlobalTradingCharts } from "@/components/trading/GlobalTradingCharts";
import { GlobalTradingStats } from "@/components/trading/GlobalTradingStats";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
                    <Card className="border border-white/10 bg-black/20">
                        <CardHeader>
                            <CardTitle className="text-white">
                                Performance Charts
                            </CardTitle>
                            <CardDescription className="text-white/60">
                                Visual analysis of your overall performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GlobalTradingCharts
                                sessions={sessions}
                                trades={trades}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            <DiscordWelcomeChecker />
        </>
    );
}
