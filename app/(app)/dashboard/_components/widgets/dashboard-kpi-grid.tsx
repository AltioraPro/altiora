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

interface DashboardKpiGridProps {
    stats: RouterOutput["trading"]["getStats"];
    trades: RouterOutput["trading"]["getTrades"];
}

function InfoTooltip({ content }: { content: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help opacity-50 transition-opacity hover:opacity-100" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px] text-xs leading-relaxed">
                {content}
            </TooltipContent>
        </Tooltip>
    );
}

interface TradeMetrics {
    avgWin: number;
    avgLoss: number;
    avgWinAmount: number;
    avgLossAmount: number;
    dayWinRate: number;
    todayWins: number;
    todayLosses: number;
    todayTotal: number;
    winDays: number;
    lossDays: number;
    totalDays: number;
}

function calculateTradeMetrics(
    trades: RouterOutput["trading"]["getTrades"]
): TradeMetrics {
    const defaultMetrics: TradeMetrics = {
        avgWin: 0,
        avgLoss: 0,
        avgWinAmount: 0,
        avgLossAmount: 0,
        dayWinRate: 0,
        todayWins: 0,
        todayLosses: 0,
        todayTotal: 0,
        winDays: 0,
        lossDays: 0,
        totalDays: 0,
    };

    if (!trades || trades.length === 0) {
        return defaultMetrics;
    }

    let totalWinPct = 0;
    let countWin = 0;
    let totalLossPct = 0;
    let countLoss = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;

    const today = new Date();
    let todayWins = 0;
    let todayLosses = 0;
    let todayTotal = 0;

    const dailyPnL = new Map<string, number>();

    for (const trade of trades) {
        const pnl = Number(trade.profitLossPercentage) || 0;
        const pnlAmount = Number(trade.profitLossAmount) || 0;
        const tradeDate = new Date(trade.tradeDate);
        const dateKey = tradeDate.toISOString().split("T")[0] ?? "";

        dailyPnL.set(dateKey, (dailyPnL.get(dateKey) || 0) + pnl);

        if (pnl > 0) {
            totalWinPct += pnl;
            totalWinAmount += pnlAmount;
            countWin++;
        } else if (pnl < 0) {
            totalLossPct += Math.abs(pnl);
            totalLossAmount += Math.abs(pnlAmount);
            countLoss++;
        }

        const isToday =
            tradeDate.getDate() === today.getDate() &&
            tradeDate.getMonth() === today.getMonth() &&
            tradeDate.getFullYear() === today.getFullYear();

        if (isToday) {
            todayTotal++;
            if (pnl > 0) todayWins++;
            else if (pnl < 0) todayLosses++;
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
        avgWinAmount: countWin > 0 ? totalWinAmount / countWin : 0,
        avgLossAmount: countLoss > 0 ? totalLossAmount / countLoss : 0,
        dayWinRate: dailyPnL.size > 0 ? (winDays / dailyPnL.size) * 100 : 0,
        todayWins,
        todayLosses,
        todayTotal,
        winDays,
        lossDays,
        totalDays: dailyPnL.size,
    };
}

export function DashboardKpiGrid({ stats, trades }: DashboardKpiGridProps) {
    // Calculate detailed metrics from trades
    const tradeMetrics = calculateTradeMetrics(trades);

    const totalPnL =
        typeof stats.totalPnL === "string"
            ? Number.parseFloat(stats.totalPnL) || 0
            : stats.totalPnL;

    const profitFactor = stats.profitFactor ?? 0;

    // Calculate avg win/loss ratio for the bar
    let avgWinLossRatio = 0;
    if (tradeMetrics.avgLoss > 0) {
        avgWinLossRatio = tradeMetrics.avgWin / tradeMetrics.avgLoss;
    } else if (tradeMetrics.avgWin > 0) {
        avgWinLossRatio = Number.POSITIVE_INFINITY;
    }

    // Calculate bar widths
    const totalAvg = tradeMetrics.avgWin + tradeMetrics.avgLoss;
    const winBarWidth =
        totalAvg > 0 ? (tradeMetrics.avgWin / totalAvg) * 100 : 50;
    const lossBarWidth =
        totalAvg > 0 ? (tradeMetrics.avgLoss / totalAvg) * 100 : 50;

    return (
        <TooltipProvider delayDuration={100}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* KPI 1: Net P&L */}
                <Card className="relative overflow-hidden border-none bg-white shadow-sm dark:bg-secondary/20">
                    <CardContent className="flex h-full flex-col justify-between p-6">
                        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                            <span className="font-medium text-xs uppercase tracking-wider">
                                Net P&L
                            </span>
                            <InfoTooltip content="Total cumulative performance across all closed trades, expressed as a percentage of your account." />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span
                                className={cn(
                                    "font-bold text-2xl tracking-tight",
                                    totalPnL >= 0
                                        ? "text-emerald-500"
                                        : "text-rose-500"
                                )}
                            >
                                {totalPnL > 0 ? "+" : ""}
                                {totalPnL.toFixed(2)}%
                            </span>
                            <div className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
                                <span className="rounded bg-secondary px-1.5 py-0.5 font-semibold text-[10px]">
                                    {stats.totalTrades} trades
                                </span>
                            </div>
                        </div>
                        <div className="absolute top-4 right-4 rounded-lg bg-secondary/50 p-2">
                            <TrendingUp
                                className={cn(
                                    "h-4 w-4",
                                    totalPnL >= 0
                                        ? "text-emerald-500"
                                        : "text-rose-500"
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* KPI 2: Trade Win % */}
                <KpiGaugeCard
                    color={stats.winRate >= 50 ? "#10b981" : "#ef4444"}
                    subValues={{
                        win: stats.winningTrades,
                        loss: stats.losingTrades,
                    }}
                    title="Trade win %"
                    tooltip="Percentage of winning trades out of all closed trades. Calculated as: (Winning Trades / Total Closed Trades) × 100"
                    value={stats.winRate}
                />

                {/* KPI 3: Profit Factor */}
                <KpiCircleCard
                    title="Profit factor"
                    tooltip="Ratio of gross profits to gross losses. A value above 1.5 is considered good, above 2.0 is excellent. Calculated as: Total Gains / Total Losses"
                    value={profitFactor}
                />

                {/* KPI 4: Day Win % */}
                <KpiGaugeCard
                    color={
                        tradeMetrics.dayWinRate >= 50 ? "#10b981" : "#ef4444"
                    }
                    subValues={{
                        win: tradeMetrics.winDays,
                        loss: tradeMetrics.lossDays,
                    }}
                    title="Day win %"
                    tooltip="Percentage of profitable trading days. A day is considered winning if the sum of all trades that day is positive. Calculated as: (Green Days / Total Trading Days) × 100"
                    value={tradeMetrics.dayWinRate}
                />

                {/* KPI 5: Avg win/loss trade */}
                <Card className="border-none bg-white shadow-sm dark:bg-secondary/20">
                    <CardContent className="flex h-full flex-col justify-center p-6">
                        <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                            <span className="font-medium text-xs uppercase tracking-wider">
                                Avg win/loss
                            </span>
                            <InfoTooltip content="Risk/Reward ratio based on actual trades. Shows average winning trade size divided by average losing trade size. A ratio above 1.5 means your winners are bigger than your losers." />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-baseline justify-between">
                                <span className="font-bold text-2xl">
                                    {Number.isFinite(avgWinLossRatio)
                                        ? avgWinLossRatio.toFixed(2)
                                        : "∞"}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    R:R
                                </span>
                            </div>

                            {/* Bar Visualization */}
                            <div className="relative mt-2 flex h-2 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="h-full rounded-l-full bg-emerald-500"
                                    style={{ width: `${winBarWidth}%` }}
                                />
                                <div
                                    className="h-full rounded-r-full bg-rose-500"
                                    style={{ width: `${lossBarWidth}%` }}
                                />
                            </div>

                            <div className="mt-2 flex justify-between font-medium text-xs">
                                <span className="text-emerald-500">
                                    +{tradeMetrics.avgWin.toFixed(1)}%
                                </span>
                                <span className="text-rose-500">
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

function KpiGaugeCard({
    title,
    value,
    subValues,
    tooltip,
}: {
    title: string;
    value: number;
    subValues: { win: number; loss: number };
    color: string;
    tooltip: string;
}) {
    // Calculate the win percentage for the gauge (green portion)
    const winPercentage = Math.min(Math.max(value, 0), 100);
    const lossPercentage = 100 - winPercentage;

    // SVG arc calculations for semi-circle gauge
    const radius = 30;
    const strokeWidth = 8;
    const circumference = Math.PI * radius; // Half circle

    const winArc = (winPercentage / 100) * circumference;
    const lossArc = (lossPercentage / 100) * circumference;

    return (
        <Card className="border-none bg-white shadow-sm dark:bg-secondary/20">
            <CardContent className="relative flex h-full items-center justify-between p-6">
                <div className="z-10 flex flex-col justify-center">
                    <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-xs uppercase tracking-wider">
                            {title}
                        </span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <InfoIcon className="h-3 w-3 cursor-help opacity-50 transition-opacity hover:opacity-100" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px] text-xs leading-relaxed">
                                {tooltip}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div
                        className={cn(
                            "font-bold text-2xl tracking-tight",
                            value >= 50 ? "text-emerald-500" : "text-rose-500"
                        )}
                    >
                        {value.toFixed(2)}%
                    </div>
                    <div className="mt-2 flex gap-2">
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-medium text-[10px] text-emerald-500">
                            {subValues.win}
                        </span>
                        <span className="rounded bg-rose-500/10 px-1.5 py-0.5 font-medium text-[10px] text-rose-500">
                            {subValues.loss}
                        </span>
                    </div>
                </div>
                <div className="-translate-y-1/2 absolute top-1/2 right-4 flex h-[80px] w-[80px] items-center justify-center">
                    <svg height="50" viewBox="0 0 80 50" width="80">
                        <title>Win rate gauge</title>
                        {/* Background arc (gray) */}
                        <path
                            className="text-secondary"
                            d="M 5 45 A 35 35 0 0 1 75 45"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth={strokeWidth}
                        />
                        {/* Green arc (wins) - starts from left */}
                        {winPercentage > 0 && (
                            <path
                                d="M 5 45 A 35 35 0 0 1 75 45"
                                fill="none"
                                stroke="#10b981"
                                strokeDasharray={`${winArc} ${circumference}`}
                                strokeLinecap="round"
                                strokeWidth={strokeWidth}
                            />
                        )}
                        {/* Red arc (losses) - starts from right */}
                        {lossPercentage > 0 && (
                            <path
                                d="M 75 45 A 35 35 0 0 0 5 45"
                                fill="none"
                                stroke="#ef4444"
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
    // Progress towards a "good" profit factor (3.0 = 100%)
    const progress = Number.isFinite(value)
        ? Math.min((value / 3) * 100, 100)
        : 100;
    const data = [
        { name: "Value", value: progress },
        { name: "Rest", value: 100 - progress },
    ];

    const getColor = () => {
        if (!Number.isFinite(value)) {
            return "#10b981";
        }
        if (value >= 2) {
            return "#10b981";
        }
        if (value >= 1.5) {
            return "#f59e0b";
        }
        return "#ef4444";
    };

    return (
        <Card className="border-none bg-white shadow-sm dark:bg-secondary/20">
            <CardContent className="relative flex h-full items-center justify-between p-6">
                <div className="z-10 flex flex-col justify-center">
                    <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-xs uppercase tracking-wider">
                            {title}
                        </span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <InfoIcon className="h-3 w-3 cursor-help opacity-50 transition-opacity hover:opacity-100" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px] text-xs leading-relaxed">
                                {tooltip}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="font-bold text-2xl tracking-tight">
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
                                    className="text-secondary"
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
