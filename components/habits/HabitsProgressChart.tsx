"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { useHabits } from "./HabitsProvider";

interface ProgressData {
    date: string;
    completionPercentage: number;
}

interface HabitsProgressChartProps {
    data?: ProgressData[];
    viewMode?: "today" | "week" | "month";
    habits?: Array<{ id: string; isCompleted: boolean }>;
}

export function HabitsProgressChart({
    data,
    viewMode = "week",
    habits,
}: HabitsProgressChartProps) {
    const { getOptimisticRecentActivity } = useHabits();

    const optimisticData = getOptimisticRecentActivity(data, habits);

    const chartData = useMemo(() => {
        if (!optimisticData || optimisticData.length === 0) return [];

        let filteredData = [...optimisticData];

        if (viewMode === "week") {
            const today = new Date();
            const monday = new Date(today);
            const dayOfWeek = today.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            monday.setDate(today.getDate() - daysToMonday);

            const mondayStr = monday.toISOString().split("T")[0]!;
            const sundayStr = new Date(
                monday.getTime() + 6 * 24 * 60 * 60 * 1000
            )
                .toISOString()
                .split("T")[0]!;

            filteredData = optimisticData.filter(
                (item) => item.date >= mondayStr && item.date <= sundayStr
            );

            const weekData = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(
                    monday.getTime() + i * 24 * 60 * 60 * 1000
                );
                const dateStr = date.toISOString().split("T")[0]!;
                const existingData = filteredData.find(
                    (item) => item.date === dateStr
                );

                weekData.push({
                    date: dateStr,
                    completionPercentage:
                        existingData?.completionPercentage || 0,
                    dayName: date.toLocaleDateString("en-US", {
                        weekday: "short",
                    }),
                    dayNumber: date.getDate(),
                    isToday: dateStr === new Date().toISOString().split("T")[0],
                    trend: 0,
                });
            }

            return weekData;
        }

        if (viewMode === "month") {
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 29);

            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]!;
            const todayStr = today.toISOString().split("T")[0]!;

            filteredData = optimisticData.filter(
                (item) => item.date >= thirtyDaysAgoStr && item.date <= todayStr
            );

            const monthData = [];
            for (let i = 0; i < 30; i++) {
                const date = new Date(
                    thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000
                );
                const dateStr = date.toISOString().split("T")[0]!;
                const existingData = filteredData.find(
                    (item) => item.date === dateStr
                );

                monthData.push({
                    date: dateStr,
                    completionPercentage:
                        existingData?.completionPercentage || 0,
                    dayName: date.toLocaleDateString("en-US", {
                        weekday: "short",
                    }),
                    dayNumber: date.getDate(),
                    isToday: dateStr === new Date().toISOString().split("T")[0],
                    trend: 0,
                });
            }

            return monthData;
        }

        if (viewMode === "today") {
            const today = new Date().toISOString().split("T")[0]!;
            const todayData = optimisticData.find(
                (item) => item.date === today
            );

            return [
                {
                    date: today,
                    completionPercentage: todayData?.completionPercentage || 0,
                    dayName: new Date().toLocaleDateString("en-US", {
                        weekday: "short",
                    }),
                    dayNumber: new Date().getDate(),
                    isToday: true,
                    trend: 0,
                },
            ];
        }

        return filteredData
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .map((item, index) => ({
                ...item,
                dayName: new Date(item.date).toLocaleDateString("en-US", {
                    weekday: "short",
                }),
                dayNumber: new Date(item.date).getDate(),
                isToday: item.date === new Date().toISOString().split("T")[0],
                trend:
                    index > 0
                        ? item.completionPercentage -
                          filteredData[index - 1]!.completionPercentage
                        : 0,
            }));
    }, [optimisticData, viewMode]);

    const stats = useMemo(() => {
        if (!chartData.length)
            return { average: 0, trend: 0, bestDay: 0, worstDay: 0 };

        const percentages = chartData.map((d) => d.completionPercentage);
        const average =
            percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
        const trend =
            chartData.length > 1
                ? chartData[chartData.length - 1]!.completionPercentage -
                  chartData[0]!.completionPercentage
                : 0;
        const bestDay = Math.max(...percentages);
        const worstDay = Math.min(...percentages);

        return { average, trend, bestDay, worstDay };
    }, [chartData]);

    if (!optimisticData || optimisticData.length === 0) {
        return <HabitsProgressChartSkeleton />;
    }

    const maxHeight = viewMode === "month" ? 180 : 140;
    const chartHeight = maxHeight - 40;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xs">
            <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-xl tracking-tight">
                            PROGRESS (
                            {viewMode === "today"
                                ? "TODAY"
                                : viewMode === "week"
                                  ? "LAST 7 DAYS"
                                  : "LAST 30 DAYS"}
                            )
                        </h3>
                        <p className="mt-1 text-sm text-white/60">
                            Evolution of your daily discipline
                        </p>
                    </div>

                    <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                            <div className="font-bold text-lg">
                                {Math.round(stats.average)}%
                            </div>
                            <div className="text-white/60">AVERAGE</div>
                        </div>

                        <div className="h-8 w-px bg-white/20" />

                        <div className="flex items-center space-x-2">
                            {stats.trend > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : stats.trend < 0 ? (
                                <TrendingDown className="h-4 w-4 text-red-400" />
                            ) : (
                                <Minus className="h-4 w-4 text-white/60" />
                            )}
                            <span
                                className={` ${
                                    stats.trend > 0
                                        ? "text-green-400"
                                        : stats.trend < 0
                                          ? "text-red-400"
                                          : "text-white/60"
                                }`}
                            >
                                {stats.trend > 0 ? "+" : ""}
                                {Math.round(stats.trend)}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex flex-col justify-between opacity-20">
                        {[100, 75, 50, 25, 0].map((value) => (
                            <div
                                className="border-white/20 border-t"
                                key={value}
                            />
                        ))}
                    </div>

                    <div
                        className={`relative flex h-[230px] items-end justify-between ${
                            viewMode === "month" ? "space-x-1" : "space-x-2"
                        }`}
                    >
                        {chartData.map((item) => {
                            const height =
                                (item.completionPercentage / 100) * chartHeight;
                            const isToday = item.isToday;

                            return (
                                <div
                                    className="flex min-w-0 flex-1 flex-col items-center"
                                    key={item.date}
                                >
                                    <div className="relative flex w-full justify-center">
                                        <div
                                            className={`${
                                                viewMode === "month"
                                                    ? "w-1 max-w-1"
                                                    : "w-full max-w-8"
                                            } rounded-t-lg transition-all duration-300 ease-out ${
                                                isToday
                                                    ? "bg-linear-to-t from-green-500 to-green-400 shadow-green-500/25 shadow-lg"
                                                    : "bg-white/20 hover:bg-white/30"
                                            }`}
                                            style={{ height: `${height}px` }}
                                        />
                                    </div>

                                    <div
                                        className={`text-center ${
                                            viewMode === "month"
                                                ? "mt-1"
                                                : "mt-2"
                                        }`}
                                    >
                                        <div
                                            className={`${
                                                viewMode === "month"
                                                    ? "text-[10px]"
                                                    : "text-xs"
                                            }  ${
                                                isToday
                                                    ? "font-bold text-green-400"
                                                    : "text-white/60"
                                            }`}
                                        >
                                            {viewMode === "month"
                                                ? item.dayNumber
                                                : item.dayName}
                                        </div>
                                        {viewMode !== "month" && (
                                            <div
                                                className={`text-xs ${
                                                    isToday
                                                        ? "text-green-400"
                                                        : "text-white/40"
                                                }`}
                                            >
                                                {item.dayNumber}
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        className={`text-center ${
                                            viewMode === "month"
                                                ? "mt-0.5"
                                                : "mt-1"
                                        }`}
                                    >
                                        <div
                                            className={`${
                                                viewMode === "month"
                                                    ? "text-[10px]"
                                                    : "text-xs"
                                            }  ${
                                                isToday
                                                    ? "text-green-400"
                                                    : "text-white/50"
                                            }`}
                                        >
                                            {Math.round(
                                                item.completionPercentage
                                            )}
                                            %
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-white/10 border-t pt-6 text-sm">
                    <div className="text-center">
                        <div className="text-white/60">BEST DAY</div>
                        <div className="font-bold text-green-400 text-lg">
                            {Math.round(stats.bestDay)}%
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-white/60">WORST DAY</div>
                        <div className="font-bold text-lg text-red-400">
                            {Math.round(stats.worstDay)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HabitsProgressChartSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="mb-2 h-6 w-64 rounded bg-white/10" />
                    <div className="h-4 w-48 rounded bg-white/5" />
                </div>
                <div className="flex items-center space-x-6">
                    <div className="h-8 w-12 rounded bg-white/10" />
                    <div className="h-8 w-12 rounded bg-white/10" />
                </div>
            </div>

            <div className="h-64 rounded-xl bg-white/10" />

            <div className="mt-6 flex justify-between border-white/10 border-t pt-6">
                <div className="flex space-x-6">
                    <div className="h-4 w-20 rounded bg-white/10" />
                    <div className="h-4 w-20 rounded bg-white/10" />
                </div>
                <div className="h-4 w-32 rounded bg-white/10" />
            </div>
        </div>
    );
}
