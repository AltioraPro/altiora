"use client";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { RouterOutput } from "@/orpc/client";

interface TradingChartsProps {
    stats: RouterOutput["trading"]["getStats"];
    sessions?: Array<{
        id: string;
        name: string;
    }>;
    trades?: RouterOutput["trading"]["getTrades"];
}

const COLORS = [
    "#8B5CF6",
    "#3B82F6",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#EC4899",
];

export function TradingCharts({ stats, sessions, trades }: TradingChartsProps) {
    const winRateData = [
        {
            name: "Winners",
            value: stats.winningTrades,
            color: "#ffffff",
            percentage: stats.winRate,
        },
        {
            name: "Losers",
            value: stats.losingTrades,
            color: "#404040",
            percentage: 100 - stats.winRate,
        },
    ];

    const updateSessionStats = (
        sessionStats: Map<
            string,
            {
                name: string;
                totalPnL: number;
                count: number;
                winningTrades: number;
            }
        >,
        sessionId: string,
        sessionName: string,
        pnl: number
    ) => {
        const existing = sessionStats.get(sessionId);
        if (existing) {
            existing.totalPnL += pnl;
            existing.count += 1;
            if (pnl > 0) {
                existing.winningTrades += 1;
            }
        } else {
            sessionStats.set(sessionId, {
                name: sessionName,
                totalPnL: pnl,
                count: 1,
                winningTrades: pnl > 0 ? 1 : 0,
            });
        }
    };

    const transformSessionStats = (
        sessionStats: Map<
            string,
            {
                name: string;
                totalPnL: number;
                count: number;
                winningTrades: number;
            }
        >
    ) =>
        Array.from(sessionStats.values())
            .map((item, index) => ({
                name: item.name,
                pnl: item.totalPnL,
                count: item.count,
                winRate:
                    item.count > 0
                        ? (item.winningTrades / item.count) * 100
                        : 0,
                color: COLORS[index % COLORS.length],
            }))
            .sort((a, b) => b.pnl - a.pnl);

    const sessionPerformanceData = (() => {
        if (!(trades && sessions)) {
            return [];
        }

        const sessionStats = new Map<
            string,
            {
                name: string;
                totalPnL: number;
                count: number;
                winningTrades: number;
            }
        >();

        for (const trade of trades) {
            if (trade.sessionId) {
                const session = sessions.find((s) => s.id === trade.sessionId);
                if (session) {
                    const pnl = Number(trade.profitLossPercentage);
                    updateSessionStats(
                        sessionStats,
                        trade.sessionId,
                        session.name,
                        pnl
                    );
                }
            }
        }

        return transformSessionStats(sessionStats);
    })();

    const sessionChartWidth = Math.max(sessionPerformanceData.length * 72, 640);

    const cumulativeData = (() => {
        if (!trades) {
            return [];
        }

        const dailyMap = new Map<
            string,
            {
                dateKey: string;
                pnl: number;
            }
        >();

        for (const trade of trades) {
            const dateKey = new Date(trade.tradeDate)
                .toISOString()
                .split("T")[0];
            const pnl = Number(trade.profitLossPercentage);
            const existing = dailyMap.get(dateKey);
            if (existing) {
                existing.pnl += pnl;
            } else {
                dailyMap.set(dateKey, { dateKey, pnl });
            }
        }

        const dailyTotals = Array.from(dailyMap.values()).sort((a, b) =>
            a.dateKey.localeCompare(b.dateKey)
        );

        let cumulative = 0;
        return dailyTotals.map((day, index) => {
            cumulative += day.pnl;
            return {
                date: new Date(day.dateKey).toLocaleDateString("en-US"),
                pnl: day.pnl,
                cumulative,
                tradeNumber: index + 1,
            };
        });
    })();

    const totalPerformance =
        cumulativeData.length > 0
            ? (cumulativeData.at(-1)?.cumulative ?? 0)
            : 0;

    const isPositive = totalPerformance >= 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Win rate (back to top-left) */}
                <Card className="border border-white/20 bg-linear-to-br from-black/40 to-black/6 backdrop-blur-xs">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-white tracking-wide">
                            WIN RATE
                        </CardTitle>
                        <CardDescription className="text-white/70">
                            Performance distribution
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative flex items-center justify-center">
                            <ResponsiveContainer
                                height={220}
                                minHeight={220}
                                minWidth={200}
                                width="100%"
                            >
                                <PieChart>
                                    <defs>
                                        <linearGradient
                                            id="winnerGradient"
                                            x1="0"
                                            x2="1"
                                            y1="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#ffffff"
                                                stopOpacity={1}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#ffffff"
                                                stopOpacity={0.6}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="loserGradient"
                                            x1="0"
                                            x2="1"
                                            y1="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#404040"
                                                stopOpacity={1}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#404040"
                                                stopOpacity={0.6}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <Pie
                                        animationBegin={0}
                                        animationDuration={1200}
                                        cx="50%"
                                        cy="50%"
                                        data={winRateData}
                                        dataKey="value"
                                        endAngle={450}
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={1}
                                        startAngle={90}
                                    >
                                        {winRateData.map((entry, index) => (
                                            <Cell
                                                fill={
                                                    entry.color === "#ffffff"
                                                        ? "url(#winnerGradient)"
                                                        : "url(#loserGradient)"
                                                }
                                                key={`cell-${index}`}
                                                stroke="rgba(255,255,255,0.2)"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(0,0,0,0.95)",
                                            border: "1px solid rgba(255,255,255,0.3)",
                                            borderRadius: "10px",
                                            color: "#ffffff",
                                            backdropFilter: "blur(10px)",
                                            boxShadow:
                                                "0 4px 20px rgba(0,0,0,0.5)",
                                        }}
                                        formatter={(_value, name) => [
                                            `${name === "Winners" ? stats.winRate.toFixed(1) : (100 - stats.winRate).toFixed(1)}%`,
                                            name ?? "",
                                        ]}
                                        labelFormatter={(label: string) =>
                                            label
                                        }
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="font-bold text-2xl text-white tracking-wide">
                                        {stats.winRate.toFixed(1)}%
                                    </div>
                                    <div className="text-white/70 text-xs tracking-wide">
                                        WIN RATE
                                    </div>
                                    <div className="mt-1 text-white/50 text-xs">
                                        {stats.winningTrades}W •{" "}
                                        {stats.losingTrades}L
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center space-x-8">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full bg-white" />
                                <span className="text-white/70 text-xs tracking-wide">
                                    Winners
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full bg-gray-600" />
                                <span className="text-white/70 text-xs tracking-wide">
                                    Losers
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Session performance (right, spans two columns) */}
                <Card className="border border-white/20 bg-linear-to-br from-black/40 to-black/60 backdrop-blur-xs lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-white tracking-wide">
                            PERFORMANCE BY SESSION
                        </CardTitle>
                        <CardDescription className="text-white/70">
                            Performance by trading session
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full">
                            <div className="w-full overflow-x-auto">
                                <div
                                    style={{
                                        minWidth: `${sessionChartWidth}px`,
                                    }}
                                >
                                    <ResponsiveContainer
                                        height="100%"
                                        minHeight={280}
                                        minWidth={300}
                                        width="100%"
                                    >
                                        <BarChart
                                            data={sessionPerformanceData}
                                            margin={{
                                                top: 10,
                                                right: 20,
                                                bottom: 80,
                                                left: 10,
                                            }}
                                        >
                                            <defs>
                                                {COLORS.map((color, index) => (
                                                    <linearGradient
                                                        id={`barGradient${index}`}
                                                        key={`gradient-${index}`}
                                                        x1="0"
                                                        x2="0"
                                                        y1="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="0%"
                                                            stopColor={color}
                                                            stopOpacity={0.9}
                                                        />
                                                        <stop
                                                            offset="100%"
                                                            stopColor={color}
                                                            stopOpacity={0.3}
                                                        />
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <CartesianGrid
                                                stroke="#ffffff"
                                                strokeDasharray="3 3"
                                                strokeOpacity={0.1}
                                            />
                                            <XAxis
                                                angle={-45}
                                                axisLine={false}
                                                dataKey="name"
                                                fontSize={10}
                                                height={60}
                                                stroke="#ffffff"
                                                strokeOpacity={0.4}
                                                textAnchor="end"
                                                tickLine={false}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                domain={[
                                                    "dataMin - 5",
                                                    "dataMax + 5",
                                                ]}
                                                fontSize={10}
                                                stroke="#ffffff"
                                                strokeOpacity={0.4}
                                                tickFormatter={(value) =>
                                                    `${value.toFixed(1)}%`
                                                }
                                                tickLine={false}
                                            />
                                            <Tooltip
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
                                                            <div className="rounded-lg border border-white/20 bg-black/85 p-3 shadow-lg">
                                                                <p className="mb-1 font-medium text-white">
                                                                    {label}
                                                                </p>
                                                                <p className="text-sm text-white">
                                                                    PnL:{" "}
                                                                    <span className="font-semibold">
                                                                        {data.pnl.toFixed(
                                                                            1
                                                                        )}
                                                                        %
                                                                    </span>
                                                                </p>
                                                                <p className="text-sm text-white">
                                                                    Win Rate:{" "}
                                                                    <span className="font-semibold">
                                                                        {data.winRate.toFixed(
                                                                            1
                                                                        )}
                                                                        %
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar
                                                dataKey="pnl"
                                                radius={[4, 4, 4, 4]}
                                            >
                                                {sessionPerformanceData.map(
                                                    (_, index) => (
                                                        <Cell
                                                            fill={`url(#barGradient${index % COLORS.length})`}
                                                            key={`cell-${index}`}
                                                            stroke="rgba(255,255,255,0.1)"
                                                            strokeWidth={1}
                                                        />
                                                    )
                                                )}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="w-full border border-white/20 bg-linear-to-br from-black/40 to-black/60 backdrop-blur-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white tracking-wide">
                        CUMULATIVE PERFORMANCE
                    </CardTitle>
                    <CardDescription className="text-white/70">
                        Performance evolution over time
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="h-[250px] w-full pr-4">
                            <ResponsiveContainer
                                height="100%"
                                minHeight={250}
                                minWidth={300}
                                width="100%"
                            >
                                <AreaChart
                                    data={cumulativeData}
                                    margin={{ right: 20 }}
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
                                                        ? "#10B981"
                                                        : "#ef4444"
                                                }
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor={
                                                    isPositive
                                                        ? "#10B981"
                                                        : "#ef4444"
                                                }
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        stroke="#ffffff"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.1}
                                    />
                                    <XAxis
                                        axisLine={false}
                                        dataKey="date"
                                        fontSize={10}
                                        minTickGap={12}
                                        stroke="transparent"
                                        tick={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        fontSize={10}
                                        stroke="#ffffff"
                                        strokeOpacity={0.4}
                                        tickFormatter={(value) =>
                                            `${value.toFixed(1)}%`
                                        }
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (
                                                active &&
                                                payload &&
                                                payload.length
                                            ) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="rounded-lg border border-white/20 bg-black/90 p-3 shadow-lg">
                                                        <p className="mb-1 text-sm text-white">
                                                            {data.date}
                                                        </p>
                                                        <p className="text-sm text-white">
                                                            Cumulative:{" "}
                                                            <span className="font-semibold">
                                                                {data.cumulative.toFixed(
                                                                    1
                                                                )}
                                                                %
                                                            </span>
                                                        </p>
                                                        <p className="text-sm text-white">
                                                            Daily PnL:{" "}
                                                            <span className="font-semibold">
                                                                {data.pnl >
                                                                0 ? (
                                                                    <span className="text-green-400">
                                                                        +
                                                                        {data.pnl.toFixed(
                                                                            1
                                                                        )}
                                                                        %
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-red-400">
                                                                        {data.pnl.toFixed(
                                                                            1
                                                                        )}
                                                                        %
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        dataKey="cumulative"
                                        dot={false}
                                        fill="url(#performanceGradient)"
                                        stroke={
                                            isPositive ? "#10B981" : "#ef4444"
                                        }
                                        strokeWidth={3}
                                        type="monotone"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-white/70 tracking-wide">
                                    TOTAL PERFORMANCE
                                </div>
                                <div className="font-bold text-2xl text-white">
                                    {totalPerformance.toFixed(1)}%
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-white/70 tracking-wide">
                                    TRADES
                                </div>
                                <div className="text-center font-bold text-2xl text-white">
                                    {stats.totalTrades}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
