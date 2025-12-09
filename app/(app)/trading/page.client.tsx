"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { orpc } from "@/orpc/client";
import { dashboardSearchParams } from "../dashboard/search-params";
import { JournalsTable } from "./_components/journals-table";
import { DashboardKpiGrid } from "./_components/widgets/dashboard-kpi-grid";
import { PerformanceChartWidget } from "./_components/widgets/performance-chart";
import { TradingAnalyticsWidget } from "./_components/widgets/trading-analytics-widget";

export function TradingPageClient() {
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

    return (
        <div className="space-y-6">
            {/* Top Row: KPIs */}
            <DashboardKpiGrid stats={stats} trades={trades} />

            {/* Middle Row: Charts + Analytics */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    <PerformanceChartWidget trades={trades} />
                </div>
                <div className="lg:col-span-4">
                    {/* Altiora Score - Commented out for now */}
                    {/* <ScoreRadarWidget
                        stats={stats}
                        habitStats={habitsDashboard.stats}
                        profileStats={profileStats}
                    /> */}
                    <TradingAnalyticsWidget stats={stats} trades={trades} />
                </div>
            </div>

            <JournalsTable />
        </div>
    );
}
