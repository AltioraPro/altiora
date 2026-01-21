"use client";

import { InfoIcon, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Tooltip as RechartsTooltip,
    ReferenceLine,
    ResponsiveContainer,
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

interface TradingPerformanceWidgetProps {
    trades: RouterOutput["trading"]["getTrades"];
}

type ChartView = "cumulative" | "monthly";

interface CumulativeChartData {
    date: string;
    fullDate: string;
    pnl: number;
    cumulative: number;
    tradeNumber: number;
}

interface MonthlyChartData {
    name: string;
    pnl: number;
    count: number;
    winRate: number;
}

function PerformanceHeader({
    isPositive,
    finalPnL,
    hasData,
    view,
    setView,
}: {
    isPositive: boolean;
    finalPnL: number;
    hasData: boolean;
    view: ChartView;
    setView: (view: ChartView) => void;
}) {
    return (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-4">
                <CardTitle className="flex items-center gap-2 font-medium text-base">
                    Performance
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <InfoIcon className="h-3.5 w-3.5 cursor-help text-muted-foreground opacity-50 transition-opacity hover:opacity-100" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px] text-xs leading-relaxed bg-black border-zinc-800 text-zinc-300 ring-1 ring-white/10">
                            <p>
                                <strong className="text-white">
                                    Cumulative:
                                </strong>{" "}
                                Running total of all trade P&L over time.
                            </p>
                            <p className="mt-1">
                                <strong className="text-white">Monthly:</strong>{" "}
                                Sum of all trade P&L grouped by month.
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </CardTitle>
                {hasData && (
                    <div
                        className={cn(
                            "flex items-center gap-1 font-bold text-sm",
                            isPositive ? "text-emerald-400" : "text-red-400"
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
            <div className="flex items-center gap-1 bg-zinc-900/50 border border-zinc-800/50 p-1 rounded-none">
                <button
                    className={cn(
                        "px-3 py-1 font-bold text-[10px] uppercase tracking-wider transition-all rounded-none",
                        view === "cumulative"
                            ? "bg-zinc-800 text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-300"
                    )}
                    onClick={() => setView("cumulative")}
                    type="button"
                >
                    Cumulative
                </button>
                <button
                    className={cn(
                        "px-3 py-1 font-bold text-[10px] uppercase tracking-wider transition-all rounded-none",
                        view === "monthly"
                            ? "bg-zinc-800 text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-300"
                    )}
                    onClick={() => setView("monthly")}
                    type="button"
                >
                    Monthly
                </button>
            </div>
        </CardHeader>
    );
}

function CumulativePerformanceChart({
    data,
    isPositive,
}: {
    data: CumulativeChartData[];
    isPositive: boolean;
}) {
    return (
        <ResponsiveContainer height="100%" width="100%">
            <AreaChart
                data={data}
                margin={{
                    top: 20,
                    right: 10,
                    left: -15,
                    bottom: 0,
                }}
            >
                <defs>
                    <linearGradient
                        id="performanceGradientTrading"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor={isPositive ? "#34d399" : "#f87171"}
                            stopOpacity={0.2}
                        />
                        <stop
                            offset="100%"
                            stopColor={isPositive ? "#34d399" : "#f87171"}
                            stopOpacity={0}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    stroke="#18181b"
                    strokeDasharray="3 3"
                    vertical={false}
                />
                <ReferenceLine y={0} stroke="#27272a" strokeDasharray="4 4" />
                <YAxis
                    axisLine={false}
                    fontSize={9}
                    stroke="#52525b"
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                    tickLine={false}
                    width={40}
                />
                <RechartsTooltip
                    cursor={{
                        stroke: "#27272a",
                        strokeWidth: 1,
                    }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                                <div className="rounded-lg border border-zinc-800 bg-black p-3 text-xs shadow-xl ring-1 ring-white/10">
                                    <div className="mb-2 font-bold text-zinc-400 uppercase tracking-widest text-[10px]">
                                        {d.fullDate}
                                    </div>
                                    <div className="flex items-center justify-between gap-6 py-1">
                                        <span className="text-zinc-500 font-medium">
                                            Trade P&L:
                                        </span>
                                        <span
                                            className={cn(
                                                "font-bold",
                                                d.pnl >= 0
                                                    ? "text-emerald-400"
                                                    : "text-red-400"
                                            )}
                                        >
                                            {d.pnl >= 0 ? "+" : ""}
                                            {d.pnl.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-6 py-1 border-t border-zinc-800/50 mt-1">
                                        <span className="text-zinc-500 font-medium">
                                            Cumulative:
                                        </span>
                                        <span
                                            className={cn(
                                                "font-bold",
                                                d.cumulative >= 0
                                                    ? "text-emerald-400"
                                                    : "text-red-400"
                                            )}
                                        >
                                            {d.cumulative >= 0 ? "+" : ""}
                                            {d.cumulative.toFixed(2)}%
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
                    dot={
                        data.length <= 30
                            ? {
                                  r: 2.5,
                                  strokeWidth: 1.5,
                                  stroke: isPositive ? "#34d399" : "#f87171",
                                  fill: "#18181b",
                              }
                            : false
                    }
                    activeDot={{
                        r: 5,
                        strokeWidth: 2,
                        stroke: "#ffffff",
                        fill: isPositive ? "#34d399" : "#f87171",
                    }}
                    fill="url(#performanceGradientTrading)"
                    stroke={isPositive ? "#34d399" : "#f87171"}
                    strokeWidth={2}
                    type="monotone"
                    animationDuration={800}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

function MonthlyPerformanceChart({ data }: { data: MonthlyChartData[] }) {
    return (
        <ResponsiveContainer height="100%" width="100%">
            <BarChart
                data={data}
                margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                }}
            >
                <CartesianGrid
                    stroke="#18181b"
                    strokeDasharray="3 3"
                    vertical={false}
                />
                <ReferenceLine y={0} stroke="#27272a" strokeDasharray="4 4" />
                <YAxis
                    axisLine={false}
                    fontSize={9}
                    stroke="#52525b"
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                    tickLine={false}
                    width={40}
                />
                <RechartsTooltip
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                                <div className="rounded-lg border border-zinc-800 bg-black p-3 text-xs shadow-xl ring-1 ring-white/10">
                                    <div className="mb-2 font-bold text-zinc-400 uppercase tracking-widest text-[10px]">
                                        {label}
                                    </div>
                                    <div className="flex items-center justify-between gap-6 py-1">
                                        <span className="text-zinc-500 font-medium">
                                            P&L:
                                        </span>
                                        <span
                                            className={cn(
                                                "font-bold",
                                                d.pnl >= 0
                                                    ? "text-emerald-400"
                                                    : "text-red-400"
                                            )}
                                        >
                                            {d.pnl >= 0 ? "+" : ""}
                                            {d.pnl.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-6 py-1 border-t border-zinc-800/50 mt-1">
                                        <span className="text-zinc-500 font-medium">
                                            Trades:
                                        </span>
                                        <span className="font-bold text-white">
                                            {d.count}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-6 py-1">
                                        <span className="text-zinc-500 font-medium">
                                            Win Rate:
                                        </span>
                                        <span className="font-bold text-white">
                                            {d.winRate.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell
                            fill={entry.pnl >= 0 ? "#34d399" : "#f87171"}
                            key={`cell-${index}`}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

export function TradingPerformanceWidget({
    trades,
}: TradingPerformanceWidgetProps) {
    const [view, setView] = useState<ChartView>("cumulative");

    // Cumulative Performance Data
    const cumulativeData = useMemo(() => {
        return (
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
                            fullDate: new Date(
                                trade.tradeDate
                            ).toLocaleDateString("en-US"),
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
                ) || []
        );
    }, [trades]);

    // Monthly Performance Data
    const monthlyData = useMemo(() => {
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
    }, [trades]);

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
            <Card className="h-full border border-zinc-800/50 bg-background p-0 overflow-hidden ring-1 ring-white/2 rounded-none">
                <PerformanceHeader
                    isPositive={isPositive}
                    finalPnL={finalPnL}
                    hasData={hasData}
                    view={view}
                    setView={setView}
                />
                <CardContent className="p-0">
                    {hasData ? (
                        <div className="h-[300px] w-full p-6 bg-zinc-950/20">
                            {view === "cumulative" ? (
                                <CumulativePerformanceChart
                                    data={cumulativeData}
                                    isPositive={isPositive}
                                />
                            ) : (
                                <MonthlyPerformanceChart data={monthlyData} />
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
