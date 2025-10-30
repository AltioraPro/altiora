"use client";

import { Activity, BarChart3, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TradingStatsProps {
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
            symbol: string;
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
    };
    setups?: Array<{
        id: string;
        name: string;
    }>;
}

export function TradingStats({ stats }: TradingStatsProps) {
    const totalPnL =
        typeof stats.totalPnL === "string"
            ? Number.parseFloat(stats.totalPnL) || 0
            : stats.totalPnL;
    const avgWin = stats.winningTrades > 0 ? totalPnL / stats.winningTrades : 0;
    const avgLoss =
        stats.losingTrades > 0 ? Math.abs(totalPnL) / stats.losingTrades : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

    return (
        <div className="space-y-8">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-white/10 bg-black/20 p-6 transition-colors hover:bg-black/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pt-0 pb-3">
                        <CardTitle className="font-medium text-sm text-white/90">
                            Performance
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent className="space-y-2 px-0 pb-0">
                        <div
                            className={`font-bold text-3xl ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                            {totalPnL >= 0 ? "+" : ""}
                            {totalPnL.toFixed(2)}%
                        </div>
                        {stats.totalAmountPnL !== undefined &&
                            stats.journal?.usePercentageCalculation && (
                                <div
                                    className={`font-semibold text-lg ${Number(stats.totalAmountPnL) >= 0 ? "text-green-400" : "text-red-400"}`}
                                >
                                    {Number(stats.totalAmountPnL) >= 0
                                        ? "+"
                                        : ""}
                                    {Number(stats.totalAmountPnL).toFixed(2)}€
                                </div>
                            )}
                        <p className="text-sm text-white/60">
                            {stats.journal?.usePercentageCalculation
                                ? "Total Realized P&L"
                                : "Total P&L"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-white/10 bg-black/20 p-6 transition-colors hover:bg-black/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pt-0 pb-3">
                        <CardTitle className="font-medium text-sm text-white/90">
                            Win Rate
                        </CardTitle>
                        <Target className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent className="space-y-2 px-0 pb-0">
                        <div className="font-bold text-3xl text-white">
                            {stats.winRate.toFixed(1)}%
                        </div>
                        <p className="text-sm text-white/60">
                            {stats.winningTrades}/{stats.totalTrades} trades
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-white/10 bg-black/20 p-6 transition-colors hover:bg-black/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pt-0 pb-3">
                        <CardTitle className="font-medium text-sm text-white/90">
                            Trades
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent className="space-y-2 px-0 pb-0">
                        <div className="font-bold text-3xl text-white">
                            {stats.totalTrades}
                        </div>
                        <p className="text-sm text-white/60">
                            {stats.closedTrades} closed
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-white/10 bg-black/20 p-6 transition-colors hover:bg-black/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pt-0 pb-3">
                        <CardTitle className="font-medium text-sm text-white/90">
                            Profit Factor
                        </CardTitle>
                        <Activity className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent className="space-y-2 px-0 pb-0">
                        <div className="font-bold text-3xl text-white">
                            {profitFactor.toFixed(2)}
                        </div>
                        <p className="text-sm text-white/60">Win/loss ratio</p>
                    </CardContent>
                </Card>
            </div>

            {/* Exit Strategy */}
            <div className="flex justify-center">
                <Card className="w-fit border border-white/10 bg-black/20 p-2 transition-colors hover:bg-black/30">
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-green-400/60 text-sm">TP</div>
                            <div className="font-bold text-green-400 text-lg">
                                {stats.tpTrades}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-white/40">BE</div>
                            <div className="font-bold text-lg text-white">
                                {stats.beTrades}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-red-400/60 text-sm">SL</div>
                            <div className="font-bold text-lg text-red-400">
                                {stats.slTrades}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
