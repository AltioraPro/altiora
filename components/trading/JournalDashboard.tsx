"use client";

import { RiPulseLine } from "@remixicon/react";
import { useMemo } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { RouterOutput } from "@/orpc/client";

interface JournalDashboardProps {
    stats: RouterOutput["trading"]["getStats"];
    trades: RouterOutput["trading"]["getTrades"];
    sessions: RouterOutput["trading"]["getSessions"];
}

/**
 * JournalDashboard - Clean Unified Layout
 *
 * STRUCTURE:
 * Single card containing:
 * - Left: Key metrics (integrated, not separate cards)
 * - Right: Equity curve chart
 */
export function JournalDashboard({
    stats,
    trades,
    sessions,
}: JournalDashboardProps) {
    const cumulativeData = useMemo(() => {
        if (!trades || trades.length === 0) return [];

        // Group trades by day
        const dailyPnL = new Map<
            string,
            { pnl: number; tradesCount: number }
        >();

        for (const trade of trades) {
            const dateKey = new Date(trade.tradeDate).toLocaleDateString(
                "fr-FR"
            );
            const pnl = Number(trade.profitLossPercentage);
            const existing = dailyPnL.get(dateKey);
            if (existing) {
                existing.pnl += pnl;
                existing.tradesCount += 1;
            } else {
                dailyPnL.set(dateKey, { pnl, tradesCount: 1 });
            }
        }

        // Sort by date and calculate cumulative
        const sortedDays = Array.from(dailyPnL.entries())
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => {
                const [dayA, monthA, yearA] = a.date.split("/").map(Number);
                const [dayB, monthB, yearB] = b.date.split("/").map(Number);
                return (
                    new Date(yearA, monthA - 1, dayA).getTime() -
                    new Date(yearB, monthB - 1, dayB).getTime()
                );
            });

        let cumulative = 0;
        return sortedDays.map((day, index) => {
            cumulative += day.pnl;
            return {
                dayNumber: index + 1,
                cumulative,
                pnl: day.pnl,
                date: day.date,
                tradesCount: day.tradesCount,
            };
        });
    }, [trades]);

    const totalPnL =
        typeof stats.totalPnL === "string"
            ? Number.parseFloat(stats.totalPnL) || 0
            : stats.totalPnL;
    const profitFactor = stats.profitFactor ?? 0;

    // Display the server-calculated totalPnL for consistency
    const displayPerformance = totalPnL;
    const isPositive = displayPerformance >= 0;

    const chartData =
        cumulativeData.length > 0
            ? cumulativeData
            : [
                  {
                      dayNumber: 0,
                      cumulative: 0,
                      pnl: 0,
                      date: "",
                      tradesCount: 0,
                  },
              ];

    const winRateData = [
        { name: "Winners", value: stats.winningTrades, color: "#ffffff" },
        { name: "Losers", value: stats.losingTrades, color: "#3f3f46" },
    ];

    const sessionPerformanceData = useMemo(() => {
        if (!trades || !sessions) return [];

        const sessionMap = new Map<
            string,
            { name: string; pnl: number; wins: number; total: number }
        >();

        for (const trade of trades) {
            if (trade.sessionId) {
                const session = sessions.find((s) => s.id === trade.sessionId);
                if (session) {
                    const pnl = Number(trade.profitLossPercentage);
                    const isWin = trade.exitReason === "TP";
                    const existing = sessionMap.get(trade.sessionId);
                    if (existing) {
                        existing.pnl += pnl;
                        existing.total += 1;
                        if (isWin) existing.wins += 1;
                    } else {
                        sessionMap.set(trade.sessionId, {
                            name: session.name,
                            pnl,
                            wins: isWin ? 1 : 0,
                            total: 1,
                        });
                    }
                }
            }
        }

        return Array.from(sessionMap.values())
            .map((s) => ({
                ...s,
                winRate: s.total > 0 ? (s.wins / s.total) * 100 : 0,
            }))
            .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
            .slice(0, 4);
    }, [trades, sessions]);

    return (
        <Card className="mb-6 border border-zinc-800/50 bg-background p-0 overflow-hidden ring-1 ring-white/2">
            <div className="grid grid-cols-1 lg:grid-cols-4">
                {/* Left: Stats Panel */}
                <div className="border-b border-zinc-800/50 p-6 lg:border-b-0 lg:border-r">
                    {/* Performance Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                Total Performance
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500/80">
                                    Max Streak
                                </span>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[8px] font-bold uppercase text-emerald-500/50">
                                            W
                                        </span>
                                        <span className="font-bold text-sm text-emerald-400">
                                            {stats.maxWinningStreak}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[8px] font-bold uppercase text-red-500/50">
                                            L
                                        </span>
                                        <span className="font-bold text-sm text-red-400">
                                            {stats.maxLosingStreak}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className={`font-bold text-4xl tracking-tight ${isPositive ? "text-emerald-400" : "text-red-400"} drop-shadow-[0_0_15px_rgba(16,185,129,0.1)]`}
                        >
                            {isPositive ? "+" : ""}
                            {displayPerformance.toFixed(2)}%
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Profit Factor */}
                        <div className="bg-zinc-900/30 border border-zinc-800/40 p-4 rounded-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <RiPulseLine className="size-3.5 text-zinc-400" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                                    PF
                                </span>
                            </div>
                            <div className="font-bold text-2xl tracking-tight text-white">
                                {Number.isFinite(profitFactor)
                                    ? profitFactor.toFixed(2)
                                    : "∞"}
                            </div>
                        </div>

                        {/* Win Rate */}
                        <div className="bg-zinc-900/30 border border-zinc-800/40 p-4 rounded-sm">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                                Win Rate
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <ResponsiveContainer height={36} width={36}>
                                        <PieChart>
                                            <Pie
                                                animationDuration={600}
                                                cx="50%"
                                                cy="50%"
                                                data={winRateData}
                                                dataKey="value"
                                                endAngle={450}
                                                innerRadius={12}
                                                outerRadius={16}
                                                paddingAngle={2}
                                                startAngle={90}
                                                stroke="none"
                                            >
                                                {winRateData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                        />
                                                    )
                                                )}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <span className="font-bold text-2xl tracking-tight text-white">
                                    {stats.winRate.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Trade Distribution */}
                    <div className="bg-zinc-900/30 border border-zinc-800/40 p-4 mb-6 rounded-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                                Distribution
                            </span>
                            <span className="text-[10px] font-bold text-zinc-300">
                                {stats.totalTrades} trades
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 text-center">
                                <div className="font-bold text-xl text-emerald-400">
                                    {stats.tpTrades}
                                </div>
                                <div className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/70">
                                    TP
                                </div>
                            </div>
                            <div className="w-px bg-zinc-800/50" />
                            <div className="flex-1 text-center">
                                <div className="font-bold text-xl text-white">
                                    {stats.beTrades}
                                </div>
                                <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                                    BE
                                </div>
                            </div>
                            <div className="w-px bg-zinc-800/50" />
                            <div className="flex-1 text-center">
                                <div className="font-bold text-xl text-red-400">
                                    {stats.slTrades}
                                </div>
                                <div className="text-[8px] font-bold uppercase tracking-widest text-red-500/70">
                                    SL
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sessions */}
                    {sessionPerformanceData.length > 0 && (
                        <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                                By Session
                            </div>
                            <div className="space-y-2">
                                {sessionPerformanceData.map(
                                    (session, index) => {
                                        const isPositivePnl = session.pnl >= 0;
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between bg-zinc-900/20 border border-zinc-800/30 px-3 py-2 rounded-sm"
                                            >
                                                <span
                                                    className="text-[14px] font-bold text-white truncate max-w-[170px]"
                                                    title={session.name}
                                                >
                                                    {session.name}
                                                </span>
                                                <div className="flex items-center gap-3 text-[11px]">
                                                    <div className="flex items-center gap-1.5 border-r border-zinc-800/40 pr-3">
                                                        <span className="font-bold uppercase text-zinc-500 text-[9px]">
                                                            WR
                                                        </span>
                                                        <span className="font-bold text-zinc-100">
                                                            {session.winRate.toFixed(
                                                                0
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`font-bold tracking-tight ${isPositivePnl ? "text-emerald-400" : "text-red-400"} text-sm`}
                                                    >
                                                        {isPositivePnl
                                                            ? "+"
                                                            : ""}
                                                        {session.pnl.toFixed(1)}
                                                        %
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Chart */}
                <div className="p-6 lg:col-span-3 mb-8 bg-zinc-950/20">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                            Cumulative Performance
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-sm">
                            {trades?.length || 0} pos
                        </span>
                    </div>

                    <div className="h-full w-full flex items-center mb-5">
                        <ResponsiveContainer height="100%" width="100%">
                            <AreaChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -15,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="performance-gradient"
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
                                            stopOpacity={0.2}
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
                                    stroke="#18181b"
                                    vertical={false}
                                />
                                <ReferenceLine
                                    y={0}
                                    stroke="#27272a"
                                    strokeDasharray="4 4"
                                />
                                <YAxis
                                    axisLine={false}
                                    fontSize={9}
                                    stroke="#52525b"
                                    tickFormatter={(v) => `${v.toFixed(0)}%`}
                                    tickLine={false}
                                    width={40}
                                />
                                <Tooltip
                                    cursor={{
                                        stroke: "#27272a",
                                        strokeWidth: 1,
                                    }}
                                    content={({ active, payload }) => {
                                        if (
                                            active &&
                                            payload &&
                                            payload.length
                                        ) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="border border-zinc-800 bg-black p-3 shadow-2xl ring-1 ring-white/10">
                                                    <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                                        {data.date}
                                                    </div>
                                                    <div className="font-bold text-lg tracking-tight text-white">
                                                        {data.cumulative.toFixed(
                                                            2
                                                        )}
                                                        %
                                                    </div>
                                                    <div className="text-[10px] text-zinc-400 mt-1 pt-1 border-t border-zinc-800">
                                                        {data.tradesCount}{" "}
                                                        trades •{" "}
                                                        <span
                                                            className={
                                                                data.pnl >= 0
                                                                    ? "text-emerald-400"
                                                                    : "text-red-400"
                                                            }
                                                        >
                                                            {data.pnl >= 0
                                                                ? "+"
                                                                : ""}
                                                            {data.pnl.toFixed(
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
                                    dot={
                                        chartData.length <= 30
                                            ? {
                                                  r: 2.5,
                                                  strokeWidth: 1.5,
                                                  stroke: isPositive
                                                      ? "#10b981"
                                                      : "#ef4444",
                                                  fill: "#18181b",
                                              }
                                            : false
                                    }
                                    activeDot={{
                                        r: 5,
                                        strokeWidth: 2,
                                        stroke: "#ffffff",
                                        fill: isPositive
                                            ? "#10b981"
                                            : "#ef4444",
                                    }}
                                    fill="url(#performance-gradient)"
                                    stroke={isPositive ? "#10b981" : "#ef4444"}
                                    strokeWidth={2}
                                    type="monotone"
                                    animationDuration={800}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Card>
    );
}
