"use client";

import { InfoIcon, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RouterOutput } from "@/orpc/client";

interface PerformanceChartWidgetProps {
    trades: RouterOutput["trading"]["getTrades"];
}

type ChartView = "cumulative" | "monthly";

export function PerformanceChartWidget({
    trades,
}: PerformanceChartWidgetProps) {
    const [view, setView] = useState<ChartView>("cumulative");

    // Cumulative Performance Data
    const cumulativeData =
        trades
            ?.sort(
                (a, b) =>
                    new Date(a.tradeDate).getTime() -
                    new Date(b.tradeDate).getTime()
            )
            .reduce(
                (acc, trade) => {
                    const pnl = Number(trade.profitLossPercentage);
                    const previousCumulative =
                        acc.length > 0 ? (acc.at(-1)?.cumulative ?? 0) : 0;

                    const cumulative = previousCumulative + pnl;

                    acc.push({
                        date: new Date(trade.tradeDate).toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric",
                            }
                        ),
                        fullDate: new Date(trade.tradeDate).toLocaleDateString(
                            "en-US"
                        ),
                        pnl,
                        cumulative,
                        tradeNumber: acc.length + 1,
                    });
                    return acc;
                },
                [] as Array<{
                    date: string;
                    fullDate: string;
                    pnl: number;
                    cumulative: number;
                    tradeNumber: number;
                }>
            ) || [];

    // Monthly Performance Data
    const monthlyData = (() => {
        if (!trades || trades.length === 0) {
            return [];
        }

        const monthStats = new Map<
            string,
            {
                key: string;
                label: string;
                totalPnL: number;
                count: number;
                winningTrades: number;
            }
        >();

        for (const trade of trades) {
            const date = new Date(trade.tradeDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const key = `${year}-${month}`;
            const label = date.toLocaleString("en-US", { month: "short" });
            const pnl = Number(trade.profitLossPercentage);
            const existing = monthStats.get(key);

            if (existing) {
                existing.totalPnL += pnl;
                existing.count += 1;
                if (pnl > 0) {
                    existing.winningTrades += 1;
                }
            } else {
                monthStats.set(key, {
                    key,
                    label,
                    totalPnL: pnl,
                    count: 1,
                    winningTrades: pnl > 0 ? 1 : 0,
                });
            }
        }

        return Array.from(monthStats.values())
            .sort((a, b) => (a.key < b.key ? -1 : 1))
            .map((item) => ({
                name: item.label,
                pnl: item.totalPnL,
                count: item.count,
                winRate:
                    item.count > 0
                        ? (item.winningTrades / item.count) * 100
                        : 0,
            }));
    })();

    const isPositive =
        cumulativeData.length > 0
            ? (cumulativeData.at(-1)?.cumulative ?? 0) >= 0
            : true;

    const finalPnL =
        cumulativeData.length > 0
            ? (cumulativeData.at(-1)?.cumulative ?? 0)
            : 0;

    const hasData = trades && trades.length > 0;

    return (
        <TooltipProvider delayDuration={100}>
            <Card className="h-full border-none bg-white shadow-sm dark:bg-secondary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-4">
                        <CardTitle className="flex items-center gap-2 font-medium text-base">
                            Performance
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <InfoIcon className="h-3.5 w-3.5 cursor-help text-muted-foreground opacity-50 transition-opacity hover:opacity-100" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[280px] text-xs leading-relaxed">
                                    <p>
                                        <strong>Cumulative:</strong> Running
                                        total of all trade P&L over time. Shows
                                        your equity curve progression.
                                    </p>
                                    <p className="mt-1">
                                        <strong>Monthly:</strong> Sum of all
                                        trade P&L grouped by month. Green =
                                        profitable month, Red = losing month.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </CardTitle>
                        {hasData && (
                            <div
                                className={cn(
                                    "flex items-center gap-1 font-bold text-sm",
                                    isPositive
                                        ? "text-emerald-500"
                                        : "text-rose-500"
                                )}
                            >
                                {isPositive ? (
                                    <TrendingUp className="h-4 w-4" />
                                ) : (
                                    <TrendingDown className="h-4 w-4" />
                                )}
                                {finalPnL >= 0 ? "+" : ""}
                                {finalPnL.toFixed(2)}%
                            </div>
                        )}
                    </div>
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
                        <button
                            className={cn(
                                "rounded-md px-3 py-1 font-medium text-xs transition-colors",
                                view === "cumulative"
                                    ? "bg-background shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setView("cumulative")}
                            type="button"
                        >
                            Cumulative
                        </button>
                        <button
                            className={cn(
                                "rounded-md px-3 py-1 font-medium text-xs transition-colors",
                                view === "monthly"
                                    ? "bg-background shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setView("monthly")}
                            type="button"
                        >
                            Monthly
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    {hasData ? (
                        <div className="h-[300px] w-full">
                            {view === "cumulative" ? (
                                <ResponsiveContainer height="100%" width="100%">
                                    <AreaChart
                                        data={cumulativeData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: 0,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="performanceGradient"
                                                x1="0"
                                                x2="0"
                                                y1="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor={
                                                        isPositive
                                                            ? "#10b981"
                                                            : "#ef4444"
                                                    }
                                                    stopOpacity={0.4}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={
                                                        isPositive
                                                            ? "#10b981"
                                                            : "#ef4444"
                                                    }
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            className="text-muted/10"
                                            stroke="currentColor"
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />
                                        <XAxis
                                            axisLine={false}
                                            className="text-muted-foreground"
                                            dataKey="date"
                                            minTickGap={50}
                                            tick={{
                                                fontSize: 10,
                                                fill: "currentColor",
                                            }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            className="text-muted-foreground"
                                            tick={{
                                                fontSize: 10,
                                                fill: "currentColor",
                                            }}
                                            tickFormatter={(value) =>
                                                `${value.toFixed(0)}%`
                                            }
                                            tickLine={false}
                                        />
                                        <RechartsTooltip
                                            content={({ active, payload }) => {
                                                if (
                                                    active &&
                                                    payload &&
                                                    payload.length
                                                ) {
                                                    const data =
                                                        payload[0].payload;
                                                    return (
                                                        <div className="rounded-lg border bg-background p-3 text-xs shadow-md">
                                                            <div className="mb-1 font-medium">
                                                                {data.fullDate}
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-muted-foreground">
                                                                    Trade P&L:
                                                                </span>
                                                                <span
                                                                    className={cn(
                                                                        "font-bold",
                                                                        data.pnl >=
                                                                            0
                                                                            ? "text-emerald-500"
                                                                            : "text-rose-500"
                                                                    )}
                                                                >
                                                                    {data.pnl >=
                                                                    0
                                                                        ? "+"
                                                                        : ""}
                                                                    {data.pnl.toFixed(
                                                                        2
                                                                    )}
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-muted-foreground">
                                                                    Cumulative:
                                                                </span>
                                                                <span
                                                                    className={cn(
                                                                        "font-bold",
                                                                        data.cumulative >=
                                                                            0
                                                                            ? "text-emerald-500"
                                                                            : "text-rose-500"
                                                                    )}
                                                                >
                                                                    {data.cumulative >=
                                                                    0
                                                                        ? "+"
                                                                        : ""}
                                                                    {data.cumulative.toFixed(
                                                                        2
                                                                    )}
                                                                    %
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            dataKey="cumulative"
                                            fill="url(#performanceGradient)"
                                            stroke={
                                                isPositive
                                                    ? "#10b981"
                                                    : "#ef4444"
                                            }
                                            strokeWidth={2}
                                            type="monotone"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer height="100%" width="100%">
                                    <BarChart
                                        data={monthlyData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: 0,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            className="text-muted/10"
                                            stroke="currentColor"
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />
                                        <XAxis
                                            axisLine={false}
                                            className="text-muted-foreground"
                                            dataKey="name"
                                            tick={{
                                                fontSize: 10,
                                                fill: "currentColor",
                                            }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            className="text-muted-foreground"
                                            tick={{
                                                fontSize: 10,
                                                fill: "currentColor",
                                            }}
                                            tickFormatter={(value) =>
                                                `${value.toFixed(0)}%`
                                            }
                                            tickLine={false}
                                        />
                                        <RechartsTooltip
                                            content={({
                                                active,
                                                payload,
                                                label,
                                            }) => {
                                                if (
                                                    active &&
                                                    payload &&
                                                    payload.length
                                                ) {
                                                    const data =
                                                        payload[0].payload;
                                                    return (
                                                        <div className="rounded-lg border bg-background p-3 text-xs shadow-md">
                                                            <div className="mb-1 font-medium">
                                                                {label}
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-muted-foreground">
                                                                    P&L:
                                                                </span>
                                                                <span
                                                                    className={cn(
                                                                        "font-bold",
                                                                        data.pnl >=
                                                                            0
                                                                            ? "text-emerald-500"
                                                                            : "text-rose-500"
                                                                    )}
                                                                >
                                                                    {data.pnl >=
                                                                    0
                                                                        ? "+"
                                                                        : ""}
                                                                    {data.pnl.toFixed(
                                                                        2
                                                                    )}
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-muted-foreground">
                                                                    Trades:
                                                                </span>
                                                                <span className="font-bold">
                                                                    {data.count}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-muted-foreground">
                                                                    Win Rate:
                                                                </span>
                                                                <span className="font-bold">
                                                                    {data.winRate.toFixed(
                                                                        0
                                                                    )}
                                                                    %
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar
                                            dataKey="pnl"
                                            radius={[4, 4, 0, 0]}
                                        >
                                            {monthlyData.map((entry, index) => (
                                                <Cell
                                                    fill={
                                                        entry.pnl >= 0
                                                            ? "#10b981"
                                                            : "#ef4444"
                                                    }
                                                    key={`cell-${index}`}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
                            <TrendingUp className="mb-3 h-10 w-10 opacity-20" />
                            <span className="font-medium text-sm">
                                No trading data yet
                            </span>
                            <span className="mt-1 text-center text-xs opacity-70">
                                Log your first trade to see performance
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
