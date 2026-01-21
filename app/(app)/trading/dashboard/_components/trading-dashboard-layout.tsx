"use client";

import { useMemo } from "react";
import type { RouterOutput } from "@/orpc/client";
import { CalendarWidget } from "./calendar-widget";
import { TradingKpiStrip } from "./trading-kpi-strip";
import { TradingPerformanceWidget } from "./trading-performance-widget";
import { TradingStatsPanel } from "./trading-stats-panel";

interface TradingDashboardLayoutProps {
    stats: RouterOutput["trading"]["getStats"];
    trades: RouterOutput["trading"]["getTrades"];
}

interface DayPerformance {
    date: string;
    totalPnL: number;
    tradeCount: number;
    isPositive: boolean;
    isNeutral: boolean;
}

export function TradingDashboardLayout({
    stats,
    trades,
}: TradingDashboardLayoutProps) {
    // Calculate daily performance for calendar
    const dailyPerformance = useMemo(() => {
        if (!trades) {
            return new Map<string, DayPerformance>();
        }

        const performanceMap = new Map<string, DayPerformance>();

        for (const trade of trades) {
            if (!(trade.tradeDate && trade.isClosed)) {
                continue;
            }

            const tradeDate = new Date(trade.tradeDate)
                .toISOString()
                .split("T")[0];
            const pnlAmount = Number(trade.profitLossPercentage) || 0;

            const existing = performanceMap.get(tradeDate);
            if (existing) {
                existing.totalPnL += pnlAmount;
                existing.tradeCount += 1;
            } else {
                performanceMap.set(tradeDate, {
                    date: tradeDate,
                    totalPnL: pnlAmount,
                    tradeCount: 1,
                    isPositive: pnlAmount > 0,
                    isNeutral: pnlAmount === 0,
                });
            }
        }

        for (const day of performanceMap.values()) {
            day.isPositive = day.totalPnL > 0;
            day.isNeutral = day.totalPnL === 0;
        }

        return performanceMap;
    }, [trades]);

    // Calculate stats for the stats panel
    const calendarStats = useMemo(() => {
        const performanceArray = Array.from(dailyPerformance.values());
        const positiveDays = performanceArray.filter(
            (day) => day.isPositive
        ).length;
        const negativeDays = performanceArray.filter(
            (day) => !(day.isPositive || day.isNeutral)
        ).length;
        const neutralDays = performanceArray.filter(
            (day) => day.isNeutral
        ).length;
        const totalDays = performanceArray.length;

        return { positiveDays, negativeDays, neutralDays, totalDays };
    }, [dailyPerformance]);

    // Calculate activity per day of week
    const activityPerDay = useMemo(() => {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayStats = dayNames.map(() => ({
            count: 0,
            totalPnL: 0,
            wins: 0,
            losses: 0,
        }));

        if (trades) {
            for (const trade of trades) {
                if (trade.tradeDate && trade.isClosed) {
                    const dayOfWeek = new Date(trade.tradeDate).getDay();
                    const pnl = Number(trade.profitLossPercentage) || 0;
                    dayStats[dayOfWeek].count++;
                    dayStats[dayOfWeek].totalPnL += pnl;
                    if (pnl > 0) dayStats[dayOfWeek].wins++;
                    else if (pnl < 0) dayStats[dayOfWeek].losses++;
                }
            }
        }

        const maxCount = Math.max(...dayStats.map((d) => d.count), 1);

        return dayNames.map((name, index) => ({
            day: name,
            count: dayStats[index].count,
            percentage: (dayStats[index].count / maxCount) * 100,
            totalPnL: dayStats[index].totalPnL,
            wins: dayStats[index].wins,
            losses: dayStats[index].losses,
            winRate:
                dayStats[index].count > 0
                    ? (dayStats[index].wins / dayStats[index].count) * 100
                    : 0,
        }));
    }, [trades]);

    // Calculate trade stats (best, worst, max drawdown, closed trades)
    const tradeStats = useMemo(() => {
        if (!trades || trades.length === 0) {
            return {
                bestTrade: 0,
                worstTrade: 0,
                maxDrawdown: 0,
                closedTrades: 0,
            };
        }

        let bestTrade = Number.NEGATIVE_INFINITY;
        let worstTrade = Number.POSITIVE_INFINITY;
        let closedTrades = 0;
        let cumulativePnL = 0;
        let peak = 0;
        let maxDrawdown = 0;

        // Sort trades by date for drawdown calculation
        const sortedTrades = [...trades]
            .filter((t) => t.isClosed)
            .sort(
                (a, b) =>
                    new Date(a.tradeDate).getTime() -
                    new Date(b.tradeDate).getTime()
            );

        for (const trade of sortedTrades) {
            const pnl = Number(trade.profitLossPercentage) || 0;
            closedTrades++;

            if (pnl > bestTrade) bestTrade = pnl;
            if (pnl < worstTrade) worstTrade = pnl;

            // Calculate max drawdown
            cumulativePnL += pnl;
            if (cumulativePnL > peak) peak = cumulativePnL;
            const drawdown = peak - cumulativePnL;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        }

        return {
            bestTrade: bestTrade === Number.NEGATIVE_INFINITY ? 0 : bestTrade,
            worstTrade:
                worstTrade === Number.POSITIVE_INFINITY ? 0 : worstTrade,
            maxDrawdown: -maxDrawdown,
            closedTrades,
        };
    }, [trades]);

    return (
        <div className="space-y-6">
            {/* KPI Strip */}
            <TradingKpiStrip stats={stats} trades={trades} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left: Performance Chart */}
                <div className="lg:col-span-8">
                    <TradingPerformanceWidget trades={trades} />
                </div>

                {/* Right: Stats Panel */}
                <div className="lg:col-span-4">
                    <TradingStatsPanel
                        calendarStats={calendarStats}
                        activityPerDay={activityPerDay}
                        tradeStats={tradeStats}
                    />
                </div>
            </div>

            {/* Calendar Widget */}
            <CalendarWidget dailyPerformance={dailyPerformance} />
        </div>
    );
}
