"use client";

import type { RouterOutput } from "@/orpc/client";
import { DashboardKpiGrid } from "./widgets/dashboard-kpi-grid";
import { DeepworkWidget } from "./widgets/deepwork-widget";
import { GoalWidget } from "./widgets/goal-widget";
import { HabitWidget } from "./widgets/habit-widget";
import { PerformanceChartWidget } from "./widgets/performance-chart";
// import { ScoreRadarWidget } from "./widgets/score-radar";
import { TradingAnalyticsWidget } from "./widgets/trading-analytics-widget";
import { TradingStatsWidget } from "./widgets/trading-stats-widget";

interface DashboardGridProps {
    stats: RouterOutput["trading"]["getStats"];
    trades: RouterOutput["trading"]["getTrades"];
    habitsDashboard: RouterOutput["habits"]["getDashboard"];
    goals: RouterOutput["goals"]["getAll"];
    profileStats: RouterOutput["profile"]["getUserStats"];
}

export function DashboardGrid({
    stats,
    trades,
    habitsDashboard,
    goals,
    profileStats,
}: DashboardGridProps) {
    return (
        <div className="space-y-6">
            {/* Top Row: KPIs */}
            <DashboardKpiGrid stats={stats} trades={trades} />

            {/* Middle Row: Charts + Analytics */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    <PerformanceChartWidget trades={trades} />
                </div>
                <div className="lg:col-span-4">
                    {/* Altiora Score - Commented out for now */}
                    {/* <ScoreRadarWidget
                        stats={stats}
                        habitStats={habitsDashboard.stats}
                        profileStats={profileStats}
                    /> */}
                    <TradingAnalyticsWidget stats={stats} trades={trades} />
                </div>
            </div>

            {/* Bottom Row: Trading Stats + Modules */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-3">
                    <TradingStatsWidget stats={stats} />
                </div>
                <div className="lg:col-span-3">
                    <HabitWidget data={habitsDashboard} />
                </div>
                <div className="lg:col-span-3">
                    <GoalWidget goals={goals} />
                </div>
                <div className="lg:col-span-3">
                    <DeepworkWidget profileStats={profileStats} />
                </div>
            </div>
        </div>
    );
}
