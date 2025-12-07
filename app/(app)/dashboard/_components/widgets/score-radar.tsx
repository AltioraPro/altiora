"use client";

import { InfoIcon } from "lucide-react";
import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RouterOutput } from "@/orpc/client";

interface ScoreRadarWidgetProps {
    stats: RouterOutput["trading"]["getStats"];
    habitStats: RouterOutput["habits"]["getDashboard"]["stats"];
    profileStats: RouterOutput["profile"]["getUserStats"];
}

export function ScoreRadarWidget({
    stats,
    habitStats,
    profileStats,
}: ScoreRadarWidgetProps) {
    // Win Rate Score (0-100)
    const winRateScore = Math.min(stats.winRate, 100);

    // Profit Factor Score (target 3.0 = 100%)
    const profitFactor = stats.profitFactor ?? 0;
    const profitFactorScore = Number.isFinite(profitFactor)
        ? Math.min((profitFactor / 3) * 100, 100)
        : 100;

    // Habit Consistency Score (average completion rate)
    const consistencyScore = habitStats.averageCompletionRate ?? 0;

    // Current Streak as Discipline indicator (max streak = 30 days target)
    const maxStreakTarget = 30;
    const disciplineScore = Math.min(
        (habitStats.currentStreak / maxStreakTarget) * 100,
        100
    );

    // Recovery Factor (based on winning streaks vs losing streaks)
    const maxWin = stats.maxWinningStreak ?? 1;
    const maxLoss = stats.maxLosingStreak ?? 1;
    const recoveryScore =
        maxLoss > 0
            ? Math.min((maxWin / (maxWin + maxLoss)) * 100 * 1.5, 100)
            : 100;

    // Focus Score (based on deepwork completion rate and total time)
    const { deepwork } = profileStats;
    const focusCompletionRate =
        deepwork.totalSessions > 0
            ? (deepwork.completedSessions / deepwork.totalSessions) * 100
            : 0;
    // Bonus points for total time (1 hour = 10 points, max 50 bonus)
    const timeBonus = Math.min((deepwork.totalWorkTime / 60) * 10, 50);
    const focusScore = Math.min(focusCompletionRate * 0.5 + timeBonus, 100);

    // Calculate overall Altiora Score (weighted average)
    const weights = {
        winRate: 0.2,
        profitFactor: 0.2,
        consistency: 0.2,
        discipline: 0.15,
        recovery: 0.1,
        focus: 0.15,
    };

    const globalScore =
        winRateScore * weights.winRate +
        profitFactorScore * weights.profitFactor +
        consistencyScore * weights.consistency +
        disciplineScore * weights.discipline +
        recoveryScore * weights.recovery +
        focusScore * weights.focus;

    const data = [
        { subject: "Win %", A: Math.round(winRateScore), fullMark: 100 },
        {
            subject: "Profit F.",
            A: Math.round(profitFactorScore),
            fullMark: 100,
        },
        {
            subject: "Consistency",
            A: Math.round(consistencyScore),
            fullMark: 100,
        },
        {
            subject: "Discipline",
            A: Math.round(disciplineScore),
            fullMark: 100,
        },
        { subject: "Recovery", A: Math.round(recoveryScore), fullMark: 100 },
        { subject: "Focus", A: Math.round(focusScore), fullMark: 100 },
    ];

    // Determine score color
    const getScoreColor = (score: number) => {
        if (score >= 80) {
            return "text-emerald-500";
        }
        if (score >= 60) {
            return "text-amber-500";
        }
        return "text-rose-500";
    };

    return (
        <TooltipProvider delayDuration={100}>
            <Card className="h-full border-none bg-white shadow-sm dark:bg-secondary/20">
                <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 font-medium text-base">
                            Altiora Score
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <InfoIcon className="h-3.5 w-3.5 cursor-help text-muted-foreground opacity-50 transition-opacity hover:opacity-100" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[300px] text-xs leading-relaxed">
                                    <p className="mb-1 font-semibold">
                                        Weighted score based on 6 metrics:
                                    </p>
                                    <ul className="space-y-0.5">
                                        <li>
                                            • <strong>Win %</strong> (20%): Your
                                            trade win rate
                                        </li>
                                        <li>
                                            • <strong>Profit F.</strong> (20%):
                                            Profit factor vs target of 3.0
                                        </li>
                                        <li>
                                            • <strong>Consistency</strong>{" "}
                                            (20%): Average habit completion rate
                                        </li>
                                        <li>
                                            • <strong>Discipline</strong> (15%):
                                            Current streak vs 30-day target
                                        </li>
                                        <li>
                                            • <strong>Recovery</strong> (10%):
                                            Win streaks vs loss streaks ratio
                                        </li>
                                        <li>
                                            • <strong>Focus</strong> (15%):
                                            Deepwork session completion rate +
                                            time bonus
                                        </li>
                                    </ul>
                                </TooltipContent>
                            </Tooltip>
                        </CardTitle>
                        <div
                            className={`font-bold text-2xl ${getScoreColor(globalScore)}`}
                        >
                            {globalScore.toFixed(0)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative flex flex-col items-center pt-0">
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer height="100%" width="100%">
                            <RadarChart
                                cx="50%"
                                cy="50%"
                                data={data}
                                outerRadius="75%"
                            >
                                <PolarGrid
                                    className="text-muted/20"
                                    stroke="currentColor"
                                />
                                <PolarAngleAxis
                                    className="text-muted-foreground"
                                    dataKey="subject"
                                    tick={{
                                        fill: "currentColor",
                                        fontSize: 10,
                                    }}
                                />
                                <Radar
                                    dataKey="A"
                                    fill="#8b5cf6"
                                    fillOpacity={0.3}
                                    name="Score"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                />
                                <RechartsTooltip
                                    content={({ active, payload }) => {
                                        if (
                                            active &&
                                            payload &&
                                            payload.length
                                        ) {
                                            const point = payload[0];
                                            return (
                                                <div className="rounded-lg border bg-background p-2 text-xs shadow-md">
                                                    <div className="font-medium">
                                                        {point.payload.subject}
                                                    </div>
                                                    <span className="font-bold text-violet-500">
                                                        {point.value}/100
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Score Gradient Bar */}
                    <div className="w-full px-4 pb-2">
                        <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                        </div>
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div className="absolute inset-0 bg-linear-to-r from-rose-500 via-amber-500 to-emerald-500 opacity-30" />
                            <div
                                className="-translate-y-1/2 absolute top-1/2 h-3 w-3 rounded-full border-2 border-violet-500 bg-white shadow-md transition-all"
                                style={{ left: `calc(${globalScore}% - 6px)` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
