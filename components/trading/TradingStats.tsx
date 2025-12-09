"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RouterOutput } from "@/orpc/client";

interface TradingStatsProps extends React.ComponentProps<"div"> {
    stats: RouterOutput["trading"]["getStats"];
}

export function TradingStats({
    stats,
    className,
    ...props
}: TradingStatsProps) {
    const totalPnL =
        typeof stats.totalPnL === "string"
            ? Number.parseFloat(stats.totalPnL) || 0
            : stats.totalPnL;

    // Use profitFactor calculated on the server (Gains totaux / Pertes totales)
    const profitFactor = stats.profitFactor ?? 0;

    return (
        <div className={cn("space-y-8", className)} {...props}>
            {/* Performance Overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Win Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-3xl text-white">
                            {stats.winRate.toFixed(1)}%
                        </div>
                        <p className="text-sm text-white/60">
                            {stats.winningTrades}/{stats.totalTrades} trades
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Trades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-3xl text-white">
                            {stats.totalTrades}
                        </div>
                        <p className="text-sm text-white/60">
                            {stats.closedTrades} Total Trades
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Profit Factor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-3xl text-white">
                            {Number.isFinite(profitFactor)
                                ? profitFactor.toFixed(2)
                                : "∞"}
                        </div>
                        <p className="text-sm text-white/60">Win/loss ratio</p>
                    </CardContent>
                </Card>
            </div>

            {/* Exit Strategy & Streaks */}
            <div className="flex justify-center">
                <div className="flex items-center gap-8">
                    <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-center">
                        <div className="text-xs">Winning Streak</div>
                        <div className="font-bold text-sm">
                            {stats.maxWinningStreak || 0}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-center">
                            <div className="text-green-400/60 text-xs">TP</div>
                            <div className="font-bold text-green-400 text-sm">
                                {stats.tpTrades}
                            </div>
                        </div>
                        <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-center">
                            <div className="text-white/60 text-xs">BE</div>
                            <div className="font-bold text-sm text-white">
                                {stats.beTrades}
                            </div>
                        </div>
                        <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-center">
                            <div className="text-red-400/60 text-xs">SL</div>
                            <div className="font-bold text-red-400 text-sm">
                                {stats.slTrades}
                            </div>
                        </div>
                    </div>
                    <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-center">
                        <div className="text-xs">Losing Streak</div>
                        <div className="font-bold text-sm">
                            {stats.maxLosingStreak || 0}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
