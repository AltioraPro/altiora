"use client";

import { Suspense } from "react";
import { TradesTable } from "@/app/(app)/trading/_components/trades-table/trades-table";
import { AssetsManager } from "@/components/trading/AssetsManager";
import { ConfirmationsManager } from "@/components/trading/confirmations-manager";
import type { DateFilterState } from "@/components/trading/DateFilter";
import { SessionsManager } from "@/components/trading/SessionsManager";
import { TradingCharts } from "@/components/trading/TradingCharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { RouterOutput } from "@/orpc/client";

interface TradingContentProps {
    journalId: string;
    activeTab: "trades" | "assets" | "sessions" | "confirmations";
    filteredTrades: RouterOutput["trading"]["getTrades"] | undefined;
    stats: RouterOutput["trading"]["getStats"];
    sessions: Array<{ id: string; name: string }> | undefined;
    confirmations: Array<{ id: string; name: string }> | undefined;
    dateFilter: DateFilterState;
}

export function TradingContent({
    journalId,
    activeTab,
    filteredTrades,
    stats,
    sessions,
    confirmations,
    dateFilter,
}: TradingContentProps) {
    return (
        <>
            {stats &&
                sessions &&
                filteredTrades &&
                confirmations &&
                activeTab === "trades" && (
                    <div className="mb-8">
                        <Card className="border border-white/10 bg-black/20">
                            <CardHeader>
                                <CardTitle className="text-white">
                                    Performance Charts
                                </CardTitle>
                                <CardDescription className="text-white/60">
                                    Visual analysis of your trading performance
                                    {dateFilter.view !== "all" &&
                                        filteredTrades &&
                                        ` (${filteredTrades.length} trades)`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TradingCharts
                                    sessions={sessions}
                                    stats={stats}
                                    trades={filteredTrades || []}
                                />
                            </CardContent>
                        </Card>
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
