"use client";

import { InfoIcon, TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RouterOutput } from "@/orpc/client";

interface TradingKpiStripProps {
    stats: RouterOutput["trading"]["getStats"];
    trades: RouterOutput["trading"]["getTrades"];
}

interface TradeMetrics {
    avgWin: number;
    avgLoss: number;
    dayWinRate: number;
    winDays: number;
    lossDays: number;
}

function calculateTradeMetrics(
    trades: RouterOutput["trading"]["getTrades"]
): TradeMetrics {
    const defaultMetrics: TradeMetrics = {
        avgWin: 0,
        avgLoss: 0,
        dayWinRate: 0,
        winDays: 0,
        lossDays: 0,
    };

    if (!trades || trades.length === 0) {
        return defaultMetrics;
    }

    let totalWinPct = 0;
    let countWin = 0;
    let totalLossPct = 0;
    let countLoss = 0;
    const dailyPnL = new Map<string, number>();

    for (const trade of trades) {
        const pnl = Number(trade.profitLossPercentage) || 0;
        const tradeDate = new Date(trade.tradeDate);
        const dateKey = tradeDate.toISOString().split("T")[0] ?? "";

        dailyPnL.set(dateKey, (dailyPnL.get(dateKey) || 0) + pnl);

        if (pnl > 0) {
            totalWinPct += pnl;
            countWin++;
        } else if (pnl < 0) {
            totalLossPct += Math.abs(pnl);
            countLoss++;
        }
    }

    let winDays = 0;
    let lossDays = 0;
    for (const [, pnl] of dailyPnL) {
        if (pnl > 0) winDays++;
        else if (pnl < 0) lossDays++;
    }

    return {
        avgWin: countWin > 0 ? totalWinPct / countWin : 0,
        avgLoss: countLoss > 0 ? totalLossPct / countLoss : 0,
        dayWinRate: dailyPnL.size > 0 ? (winDays / dailyPnL.size) * 100 : 0,
        winDays,
        lossDays,
    };
}

export function TradingKpiStrip({ stats, trades }: TradingKpiStripProps) {
    const tradeMetrics = calculateTradeMetrics(trades);

    const totalPnL =
        typeof stats.totalPnL === "string"
            ? Number.parseFloat(stats.totalPnL) || 0
            : stats.totalPnL;

    const profitFactor = stats.profitFactor ?? 0;

    // Calculate avg win/loss ratio
    let avgWinLossRatio = 0;
    if (tradeMetrics.avgLoss > 0) {
        avgWinLossRatio = tradeMetrics.avgWin / tradeMetrics.avgLoss;
    } else if (tradeMetrics.avgWin > 0) {
        avgWinLossRatio = Number.POSITIVE_INFINITY;
    }

    // Bar widths
    const totalAvg = tradeMetrics.avgWin + tradeMetrics.avgLoss;
    const winBarWidth =
        totalAvg > 0 ? (tradeMetrics.avgWin / totalAvg) * 100 : 50;
    const lossBarWidth =
        totalAvg > 0 ? (tradeMetrics.avgLoss / totalAvg) * 100 : 50;

    return (
        <TooltipProvider delayDuration={100}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* KPI 1: Net P&L */}
                <Card className="relative overflow-hidden border border-zinc-800/50 bg-background ring-1 ring-white/2 rounded-none">
                    <CardContent className="flex h-full flex-col justify-between p-5">
                        <div className="mb-2 flex items-center gap-2 text-zinc-400">
                            <span className="font-bold text-[9px] uppercase tracking-widest">
                                Net P&L
                            </span>
                            <InfoTooltip content="Total cumulative performance across all closed trades, expressed as a percentage." />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span
                                className={cn(
                                    "font-bold text-2xl tracking-tight",
                                    totalPnL >= 0
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                )}
                            >
                                {totalPnL > 0 ? "+" : ""}
                                {totalPnL.toFixed(2)}%
                            </span>
                            <div className="mt-1 flex items-center gap-1 text-zinc-500 text-xs">
                                <span className="rounded-none bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 font-bold text-[10px]">
                                    {stats.totalTrades} trades
                                </span>
                            </div>
                        </div>
                        <div className="absolute top-4 right-4 rounded-none bg-zinc-900/50 border border-zinc-800/40 p-2">
                            <TrendingUp
                                className={cn(
                                    "h-4 w-4",
                                    totalPnL >= 0
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* KPI 2: Trade Win % */}
                <KpiGaugeCard
                    title="Trade win %"
                    value={stats.winRate}
                    subValues={{
                        win: stats.winningTrades,
                        loss: stats.losingTrades,
                    }}
                    tooltip="Percentage of winning trades out of all closed trades."
                />

                {/* KPI 3: Profit Factor */}
                <KpiCircleCard
                    title="Profit factor"
                    value={profitFactor}
                    tooltip="Ratio of gross profits to gross losses. Above 1.5 is good, above 2.0 is excellent."
                />

                {/* KPI 4: Day Win % */}
                <KpiGaugeCard
                    title="Day win %"
                    value={tradeMetrics.dayWinRate}
                    subValues={{
                        win: tradeMetrics.winDays,
                        loss: tradeMetrics.lossDays,
                    }}
                    tooltip="Percentage of profitable trading days."
                />

                {/* KPI 5: Avg win/loss trade */}
                <Card className="border border-zinc-800/50 bg-background ring-1 ring-white/2 rounded-none">
                    <CardContent className="flex h-full flex-col justify-center p-5">
                        <div className="mb-3 flex items-center gap-2 text-zinc-400">
                            <span className="font-bold text-[9px] uppercase tracking-widest">
                                Avg win/loss
                            </span>
                            <InfoTooltip content="Risk/Reward ratio. Shows average winning trade size divided by average losing trade size." />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-baseline justify-between">
                                <span className="font-bold text-2xl text-white">
                                    {Number.isFinite(avgWinLossRatio)
                                        ? avgWinLossRatio.toFixed(2)
                                        : "∞"}
                                </span>
                                <span className="text-zinc-500 text-xs font-bold">
                                    R:R
                                </span>
                            </div>

                            <div className="relative mt-2 flex h-2 w-full overflow-hidden rounded-none bg-zinc-800">
                                <div
                                    className="h-full bg-emerald-400"
                                    style={{ width: `${winBarWidth}%` }}
                                />
                                <div
                                    className="h-full bg-red-400"
                                    style={{ width: `${lossBarWidth}%` }}
                                />
                            </div>

                            <div className="mt-2 flex justify-between font-bold text-xs">
                                <span className="text-emerald-400">
                                    +{tradeMetrics.avgWin.toFixed(1)}%
                                </span>
                                <span className="text-red-400">
                                    -{tradeMetrics.avgLoss.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
}

function InfoTooltip({ content }: { content: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help opacity-50 transition-opacity hover:opacity-100" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px] text-xs leading-relaxed bg-black border-zinc-800 text-zinc-300 ring-1 ring-white/10">
                {content}
            </TooltipContent>
        </Tooltip>
    );
}

function KpiGaugeCard({
    title,
    value,
    subValues,
    tooltip,
}: {
    title: string;
    value: number;
    subValues: { win: number; loss: number };
    tooltip: string;
}) {
    const winPercentage = Math.min(Math.max(value, 0), 100);
    const lossPercentage = 100 - winPercentage;

    const radius = 30;
    const strokeWidth = 8;
    const circumference = Math.PI * radius;

    const winArc = (winPercentage / 100) * circumference;
    const lossArc = (lossPercentage / 100) * circumference;

    return (
        <Card className="relative overflow-hidden border border-zinc-800/50 bg-background ring-1 ring-white/2 rounded-none">
            <CardContent className="relative flex h-full items-center justify-between p-5">
                <div className="z-10 flex flex-col justify-center">
                    <div className="mb-1 flex items-center gap-2 text-zinc-400">
                        <span className="font-bold text-[9px] uppercase tracking-widest">
                            {title}
                        </span>
                        <InfoTooltip content={tooltip} />
                    </div>
                    <div
                        className={cn(
                            "font-bold text-2xl tracking-tight",
                            value >= 50 ? "text-emerald-400" : "text-red-400"
                        )}
                    >
                        {value.toFixed(2)}%
                    </div>
                    <div className="mt-2 flex gap-2">
                        <span className="rounded-none bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 font-bold text-[10px] text-emerald-400">
                            {subValues.win}
                        </span>
                        <span className="rounded-none bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 font-bold text-[10px] text-red-400">
                            {subValues.loss}
                        </span>
                    </div>
                </div>
                <div className="-translate-y-1/2 absolute top-1/2 right-4 flex h-[80px] w-[80px] items-center justify-center">
                    <svg height="50" viewBox="0 0 80 50" width="80">
                        <title>Win rate gauge</title>
                        <path
                            className="text-zinc-800"
                            d="M 5 45 A 35 35 0 0 1 75 45"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth={strokeWidth}
                        />
                        {winPercentage > 0 && (
                            <path
                                d="M 5 45 A 35 35 0 0 1 75 45"
                                fill="none"
                                stroke="#34d399"
                                strokeDasharray={`${winArc} ${circumference}`}
                                strokeLinecap="round"
                                strokeWidth={strokeWidth}
                            />
                        )}
                        {lossPercentage > 0 && (
                            <path
                                d="M 75 45 A 35 35 0 0 0 5 45"
                                fill="none"
                                stroke="#f87171"
                                strokeDasharray={`${lossArc} ${circumference}`}
                                strokeLinecap="round"
                                strokeWidth={strokeWidth}
                            />
                        )}
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
}

function KpiCircleCard({
    title,
    value,
    tooltip,
}: {
    title: string;
    value: number;
    tooltip: string;
}) {
    const progress = Number.isFinite(value)
        ? Math.min((value / 3) * 100, 100)
        : 100;
    const data = [
        { name: "Value", value: progress },
        { name: "Rest", value: 100 - progress },
    ];

    const getColor = () => {
        if (!Number.isFinite(value)) return "#34d399";
        if (value >= 2) return "#34d399";
        if (value >= 1.5) return "#fbbf24";
        return "#f87171";
    };

    return (
        <Card className="relative overflow-hidden border border-zinc-800/50 bg-background ring-1 ring-white/2 rounded-none">
            <CardContent className="relative flex h-full items-center justify-between p-5">
                <div className="z-10 flex flex-col justify-center">
                    <div className="mb-1 flex items-center gap-2 text-zinc-400">
                        <span className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">
                            {title}
                        </span>
                        <InfoTooltip content={tooltip} />
                    </div>
                    <div className="font-bold text-2xl tracking-tight text-white">
                        {Number.isFinite(value) ? value.toFixed(2) : "∞"}
                    </div>
                </div>
                <div className="-translate-y-1/2 absolute top-1/2 right-4 h-[60px] w-[60px]">
                    <ResponsiveContainer height="100%" width="100%">
                        <PieChart>
                            <Pie
                                cx="50%"
                                cy="50%"
                                data={data}
                                dataKey="value"
                                endAngle={-270}
                                innerRadius={22}
                                outerRadius={28}
                                startAngle={90}
                                stroke="none"
                            >
                                <Cell fill={getColor()} key="cell-0" />
                                <Cell
                                    className="text-zinc-800"
                                    fill="currentColor"
                                    key="cell-1"
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
