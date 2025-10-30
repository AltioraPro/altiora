"use client";

import { Card } from "@/components/ui/card";

interface GlobalTradingStatsProps {
    stats: {
        totalTrades: number;
        closedTrades: number;
        totalPnL: string | number;
        avgPnL: string | number;
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
    };
}

export function GlobalTradingStats({ stats }: GlobalTradingStatsProps) {
    const totalPnL =
        typeof stats.totalPnL === "string"
            ? Number.parseFloat(stats.totalPnL) || 0
            : stats.totalPnL;
    const avgPnL =
        typeof stats.avgPnL === "string"
            ? Number.parseFloat(stats.avgPnL) || 0
            : stats.avgPnL;
    const avgWin =
        stats.winningTrades > 0
            ? totalPnL / Math.max(stats.winningTrades, 1)
            : 0;
    const avgLoss =
        stats.losingTrades > 0
            ? Math.abs(totalPnL) / Math.max(stats.losingTrades, 1)
            : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

    return (
        <div className="space-y-6">
            {/* Main Metrics */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card className="border border-white/10 bg-black/20 p-5 transition-colors hover:bg-black/30">
                    <div className="space-y-2">
                        <div className="text-sm text-white/70">Performance</div>
                        <div className="font-bold text-2xl text-white">
                            {totalPnL >= 0 ? "+" : ""}
                            {totalPnL.toFixed(1)}%
                        </div>
                    </div>
                </Card>

                <Card className="border border-white/10 bg-black/20 p-5 transition-colors hover:bg-black/30">
                    <div className="space-y-2">
                        <div className="text-sm text-white/70">Win Rate</div>
                        <div className="font-bold text-2xl text-white">
                            {stats.winRate.toFixed(1)}%
                        </div>
                    </div>
                </Card>

                <Card className="border border-white/10 bg-black/20 p-5 transition-colors hover:bg-black/30">
                    <div className="space-y-2">
                        <div className="text-sm text-white/70">Trades</div>
                        <div className="font-bold text-2xl text-white">
                            {stats.totalTrades}
                        </div>
                    </div>
                </Card>

                <Card className="border border-white/10 bg-black/20 p-5 transition-colors hover:bg-black/30">
                    <div className="space-y-2">
                        <div className="text-sm text-white/70">
                            Profit Factor
                        </div>
                        <div className="font-bold text-2xl text-white">
                            {profitFactor.toFixed(2)}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="border border-white/10 bg-black/20 p-4 transition-colors hover:bg-black/30">
                    <div className="space-y-1">
                        <div className="text-white/60 text-xs">Avg Gain</div>
                        <div className="font-semibold text-lg text-white">
                            {avgWin.toFixed(1)}%
                        </div>
                    </div>
                </Card>

                <Card className="border border-white/10 bg-black/20 p-4 transition-colors hover:bg-black/30">
                    <div className="space-y-1">
                        <div className="text-white/60 text-xs">Avg Loss</div>
                        <div className="font-semibold text-lg text-white">
                            {avgLoss.toFixed(1)}%
                        </div>
                    </div>
                </Card>

                <Card className="border border-white/10 bg-black/20 p-4 transition-colors hover:bg-black/30">
                    <div className="space-y-1">
                        <div className="text-white/60 text-xs">Avg P&L</div>
                        <div className="font-semibold text-lg text-white">
                            {avgPnL.toFixed(1)}%
                        </div>
                    </div>
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
