"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { RouterOutput } from "@/orpc/client";
import { cn } from "@/lib/utils";
import { InfoIcon, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DashboardKpiGridProps {
    stats: RouterOutput["trading"]["getStats"];
    trades: RouterOutput["trading"]["getTrades"];
}

function InfoTooltip({ content }: { content: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 opacity-50 cursor-help hover:opacity-100 transition-opacity" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px] text-xs leading-relaxed">
                {content}
            </TooltipContent>
        </Tooltip>
    );
}

export function DashboardKpiGrid({ stats, trades }: DashboardKpiGridProps) {
    // Calculate detailed metrics from trades
    const tradeMetrics = (() => {
        if (!trades || trades.length === 0) {
            return {
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

        // Track daily P&L for day win rate
        const dailyPnL = new Map<string, number>();

        for (const trade of trades) {
            const pnl = Number(trade.profitLossPercentage) || 0;
            const pnlAmount = Number(trade.profitLossAmount) || 0;
            const tradeDate = new Date(trade.tradeDate);
            const dateKey = tradeDate.toISOString().split('T')[0];

            // Aggregate daily P&L
            dailyPnL.set(dateKey, (dailyPnL.get(dateKey) || 0) + pnl);

            // Avg Win/Loss logic
            if (pnl > 0) {
                totalWinPct += pnl;
                totalWinAmount += pnlAmount;
                countWin++;
            } else if (pnl < 0) {
                totalLossPct += Math.abs(pnl);
                totalLossAmount += Math.abs(pnlAmount);
                countLoss++;
            }

            // Today's trades
            if (
                tradeDate.getDate() === today.getDate() &&
                tradeDate.getMonth() === today.getMonth() &&
                tradeDate.getFullYear() === today.getFullYear()
            ) {
                todayTotal++;
                if (pnl > 0) todayWins++;
                else if (pnl < 0) todayLosses++;
            }
        }

        // Calculate winning/losing days
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
    })();

    const totalPnL =
        typeof stats.totalPnL === "string"
            ? Number.parseFloat(stats.totalPnL) || 0
            : stats.totalPnL;

    const profitFactor = stats.profitFactor ?? 0;


    // Calculate avg win/loss ratio for the bar
    const avgWinLossRatio = tradeMetrics.avgLoss > 0
        ? tradeMetrics.avgWin / tradeMetrics.avgLoss
        : tradeMetrics.avgWin > 0 ? Infinity : 0;

    // Calculate bar widths
    const totalAvg = tradeMetrics.avgWin + tradeMetrics.avgLoss;
    const winBarWidth = totalAvg > 0 ? (tradeMetrics.avgWin / totalAvg) * 100 : 50;
    const lossBarWidth = totalAvg > 0 ? (tradeMetrics.avgLoss / totalAvg) * 100 : 50;

    return (
        <TooltipProvider delayDuration={100}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* KPI 1: Net P&L */}
                <Card className="relative overflow-hidden border-none bg-white dark:bg-secondary/20 shadow-sm">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <span className="text-xs font-medium uppercase tracking-wider">Net P&L</span>
                            <InfoTooltip content="Total cumulative performance across all closed trades, expressed as a percentage of your account." />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className={cn("text-2xl font-bold tracking-tight", totalPnL >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                {totalPnL > 0 ? '+' : ''}{totalPnL.toFixed(2)}%
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                    {stats.totalTrades} trades
                                </span>
                            </div>
                        </div>
                        <div className="absolute top-4 right-4 p-2 bg-secondary/50 rounded-lg">
                            <TrendingUp className={cn("w-4 h-4", totalPnL >= 0 ? "text-emerald-500" : "text-rose-500")} />
                        </div>
                    </CardContent>
                </Card>

                {/* KPI 2: Trade Win % */}
                <KpiGaugeCard
                    title="Trade win %"
                    value={stats.winRate}
                    subValues={{ win: stats.winningTrades, loss: stats.losingTrades }}
                    color={stats.winRate >= 50 ? "#10b981" : "#ef4444"}
                    tooltip="Percentage of winning trades out of all closed trades. Calculated as: (Winning Trades / Total Closed Trades) × 100"
                />

                {/* KPI 3: Profit Factor */}
                <KpiCircleCard
                    title="Profit factor"
                    value={profitFactor}
                    tooltip="Ratio of gross profits to gross losses. A value above 1.5 is considered good, above 2.0 is excellent. Calculated as: Total Gains / Total Losses"
                />

                {/* KPI 4: Day Win % */}
                <KpiGaugeCard
                    title="Day win %"
                    value={tradeMetrics.dayWinRate}
                    subValues={{ win: tradeMetrics.winDays, loss: tradeMetrics.lossDays }}
                    color={tradeMetrics.dayWinRate >= 50 ? "#10b981" : "#ef4444"}
                    tooltip="Percentage of profitable trading days. A day is considered winning if the sum of all trades that day is positive. Calculated as: (Green Days / Total Trading Days) × 100"
                />

                {/* KPI 5: Avg win/loss trade */}
                <Card className="border-none bg-white dark:bg-secondary/20 shadow-sm">
                    <CardContent className="p-6 h-full flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                            <span className="text-xs font-medium uppercase tracking-wider">Avg win/loss</span>
                            <InfoTooltip content="Risk/Reward ratio based on actual trades. Shows average winning trade size divided by average losing trade size. A ratio above 1.5 means your winners are bigger than your losers." />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-baseline">
                                <span className="text-2xl font-bold">
                                    {Number.isFinite(avgWinLossRatio) ? avgWinLossRatio.toFixed(2) : "∞"}
                                </span>
                                <span className="text-xs text-muted-foreground">R:R</span>
                            </div>

                            {/* Bar Visualization */}
                            <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden mt-2 flex">
                                <div
                                    className="h-full bg-emerald-500 rounded-l-full"
                                    style={{ width: `${winBarWidth}%` }}
                                ></div>
                                <div
                                    className="h-full bg-rose-500 rounded-r-full"
                                    style={{ width: `${lossBarWidth}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between text-xs mt-2 font-medium">
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
    tooltip
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
        <Card className="border-none bg-white dark:bg-secondary/20 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between h-full relative">
                <div className="flex flex-col justify-center z-10">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <InfoIcon className="w-3 h-3 opacity-50 cursor-help hover:opacity-100 transition-opacity" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px] text-xs leading-relaxed">
                                {tooltip}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className={cn(
                        "text-2xl font-bold tracking-tight",
                        value >= 50 ? "text-emerald-500" : "text-rose-500"
                    )}>
                        {value.toFixed(2)}%
                    </div>
                    <div className="flex gap-2 mt-2">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-medium">
                            {subValues.win}
                        </span>
                        <span className="text-[10px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded font-medium">
                            {subValues.loss}
                        </span>
                    </div>
                </div>
                <div className="h-[80px] w-[80px] absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <svg width="80" height="50" viewBox="0 0 80 50">
                        {/* Background arc (gray) */}
                        <path
                            d="M 5 45 A 35 35 0 0 1 75 45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-secondary"
                            strokeLinecap="round"
                        />
                        {/* Green arc (wins) - starts from left */}
                        {winPercentage > 0 && (
                            <path
                                d="M 5 45 A 35 35 0 0 1 75 45"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${winArc} ${circumference}`}
                                strokeLinecap="round"
                            />
                        )}
                        {/* Red arc (losses) - starts from right */}
                        {lossPercentage > 0 && (
                            <path
                                d="M 75 45 A 35 35 0 0 0 5 45"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${lossArc} ${circumference}`}
                                strokeLinecap="round"
                            />
                        )}
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
}

function KpiCircleCard({ title, value, tooltip }: { title: string; value: number; tooltip: string }) {
    // Progress towards a "good" profit factor (3.0 = 100%)
    const progress = Number.isFinite(value) ? Math.min((value / 3) * 100, 100) : 100;
    const data = [
        { name: 'Value', value: progress },
        { name: 'Rest', value: 100 - progress },
    ];

    const getColor = () => {
        if (!Number.isFinite(value)) return "#10b981";
        if (value >= 2) return "#10b981";
        if (value >= 1.5) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <Card className="border-none bg-white dark:bg-secondary/20 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between h-full relative">
                <div className="flex flex-col justify-center z-10">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <InfoIcon className="w-3 h-3 opacity-50 cursor-help hover:opacity-100 transition-opacity" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px] text-xs leading-relaxed">
                                {tooltip}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="text-2xl font-bold tracking-tight">
                        {!Number.isFinite(value) ? "∞" : value.toFixed(2)}
                    </div>
                </div>
                <div className="h-[60px] w-[60px] absolute right-4 top-1/2 -translate-y-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={22}
                                outerRadius={28}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="cell-0" fill={getColor()} />
                                <Cell key="cell-1" fill="currentColor" className="text-secondary" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
