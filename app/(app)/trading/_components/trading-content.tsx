"use client";

import { Suspense } from "react";
import { AssetsManager } from "@/components/trading/AssetsManager";
import type { DateFilterState } from "@/components/trading/DateFilter";
import { SessionsManager } from "@/components/trading/SessionsManager";
import { SetupsManager } from "@/components/trading/SetupsManager";
import { TradesTable } from "@/components/trading/TradesTable";
import { TradingCharts } from "@/components/trading/TradingCharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { AdvancedTrade } from "@/server/db/schema";

interface TradingContentProps {
    journalId: string;
    activeTab: "trades" | "assets" | "sessions" | "setups";
    filteredTrades: AdvancedTrade[] | undefined;
    stats: {
        totalTrades: number;
        closedTrades: number;
        totalPnL: string | number;
        avgPnL: string | number;
        totalAmountPnL?: number;
        winningTrades: number;
        losingTrades: number;
        winRate: number;
        tradesBySymbol: Array<{
            assetId: string | null;
            count: number;
            totalPnL: string | null;
        }>;
        tradesBySetup: Array<{
            setupId: string | null;
            count: number;
            totalPnL: string | null;
        }>;
        tpTrades: number;
        beTrades: number;
        slTrades: number;
        journal?: {
            usePercentageCalculation?: boolean;
            startingCapital?: string;
        };
    } | null;
    sessions: Array<{ id: string; name: string }> | undefined;
    setups: Array<{ id: string; name: string }> | undefined;
    dateFilter: DateFilterState;
}

export function TradingContent({
    journalId,
    activeTab,
    filteredTrades,
    stats,
    sessions,
    setups,
    dateFilter,
}: TradingContentProps) {
    return (
        <>
            {stats &&
                sessions &&
                filteredTrades &&
                setups &&
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

                {activeTab === "setups" && (
                    <SetupsManager journalId={journalId} />
                )}
            </Suspense>
        </>
    );
}
