"use client";

import { Suspense } from "react";
import { TradesTable } from "@/app/(app)/trading/_components/trades-table/trades-table";
import { TradingChartsSkeleton } from "@/app/(app)/trading/_components/trading-charts-skeleton";
import { AssetsManager } from "@/components/trading/AssetsManager";
import { ConfirmationsManager } from "@/components/trading/confirmations-manager";
import type { DateRangeFilterState } from "@/components/trading/DateRangeFilter";
import { SessionsManager } from "@/components/trading/SessionsManager";
import { TradingCharts } from "@/components/trading/TradingCharts";
import type { RouterOutput } from "@/orpc/client";

interface TradingContentProps {
    journalId: string;
    activeTab: "trades" | "assets" | "sessions" | "confirmations";
    filteredTrades: RouterOutput["trading"]["getTrades"] | undefined;
    isLoadingStats: boolean;
    isLoadingTrades: boolean;
    stats: RouterOutput["trading"]["getStats"] | undefined;
    sessions: Array<{ id: string; name: string }> | undefined;
    confirmations: Array<{ id: string; name: string }> | undefined;
    dateRange: DateRangeFilterState;
}

export function TradingContent({
    journalId,
    activeTab,
    filteredTrades,
    isLoadingStats,
    isLoadingTrades,
    stats,
    sessions,
    confirmations,
    dateRange,
}: TradingContentProps) {
    const hasDateFilter = dateRange.from || dateRange.to;
    const showCharts = activeTab === "trades";
    const shouldShowChartsSkeleton =
        showCharts &&
        (isLoadingStats || !stats || !sessions || !filteredTrades);
    const shouldShowCharts =
        showCharts &&
        !isLoadingStats &&
        stats &&
        sessions &&
        filteredTrades &&
        confirmations;

    return (
        <>
            {shouldShowChartsSkeleton && <TradingChartsSkeleton />}
            {shouldShowCharts && (
                <div className="mb-8">
                    <div className="mb-4 flex flex-col">
                        <h2 className="font-bold text-2xl text-white">
                            Performance Charts
                        </h2>
                        <p className="text-sm text-white/60">
                            Visual analysis of your trading performance
                            {hasDateFilter &&
                                filteredTrades &&
                                ` (${filteredTrades.length} trades)`}
                        </p>
                    </div>
                    <div>
                        <TradingCharts
                            sessions={sessions}
                            stats={stats}
                            trades={filteredTrades || []}
                        />
                    </div>
                </div>
            )}

            <Suspense fallback={<div>Loading...</div>}>
                {activeTab === "trades" && (
                    <TradesTable journalId={journalId} />
                )}

                {activeTab === "assets" && (
                    <AssetsManager journalId={journalId} />
                )}

                {activeTab === "sessions" && (
                    <SessionsManager journalId={journalId} />
                )}

                {activeTab === "confirmations" && (
                    <ConfirmationsManager journalId={journalId} />
                )}
            </Suspense>
        </>
    );
}
