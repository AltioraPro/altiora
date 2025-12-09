"use client";

import { CheckCircle2, Flame, InfoIcon, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RouterOutput } from "@/orpc/client";

interface HabitWidgetProps {
    data: RouterOutput["habits"]["getDashboard"];
}

function InfoTooltip({ content }: { content: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <InfoIcon className="h-3.5 w-3.5 cursor-help text-muted-foreground opacity-50 transition-opacity hover:opacity-100" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px] text-xs leading-relaxed">
                {content}
            </TooltipContent>
        </Tooltip>
    );
}

// Calculate streak from completions
function calculateHabitStreak(
    completions: { completionDate: string; isCompleted: boolean }[]
): number {
    if (!completions || completions.length === 0) {
        return 0;
    }

    // Sort completions by date descending
    const sorted = [...completions]
        .filter((c) => c.isCompleted)
        .sort(
            (a, b) =>
                new Date(b.completionDate).getTime() -
                new Date(a.completionDate).getTime()
        );

    if (sorted.length === 0) {
        return 0;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const completion of sorted) {
        const completionDate = new Date(completion.completionDate);
        completionDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - streak);

        // Allow for today or yesterday as valid streak continuation
        const diffDays = Math.floor(
            (today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === streak || (streak === 0 && diffDays <= 1)) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

export function HabitWidget({ data }: HabitWidgetProps) {
    const { todayStats, habits, stats, recentActivity } = data;

    // Calculate streak for each habit and sort by streak
    const habitsWithStreak = habits.map((habit) => ({
        ...habit,
        calculatedStreak: calculateHabitStreak(habit.completions),
    }));

    // Take top 3 habits sorted by streak
    const displayHabits = [...habitsWithStreak]
        .sort((a, b) => b.calculatedStreak - a.calculatedStreak)
        .slice(0, 3);

    const hasHabits = habits.length > 0;

    return (
        <TooltipProvider delayDuration={100}>
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2 font-medium text-base">
                        Habits
                        <InfoTooltip content="Track your daily habits and build consistent routines. The completion rate shows how many habits you've checked off today." />
                    </CardTitle>
                    <div className="text-muted-foreground text-xs">Today</div>
                </CardHeader>
                <CardContent>
                    {hasHabits ? (
                        <div className="space-y-4">
                            {/* Today's Progress */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-bold text-2xl text-foreground">
                                        {todayStats.completionPercentage.toFixed(
                                            0
                                        )}
                                        %
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                        {todayStats.completedHabits}/
                                        {todayStats.totalHabits} completed
                                    </span>
                                </div>
                                <div className="relative h-12 w-12">
                                    <svg className="-rotate-90 h-12 w-12 transform">
                                        <title>Completion percentage</title>
                                        <circle
                                            className="text-secondary"
                                            cx="24"
                                            cy="24"
                                            fill="none"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <circle
                                            className="text-emerald-500"
                                            cx="24"
                                            cy="24"
                                            fill="none"
                                            r="20"
                                            stroke="currentColor"
                                            strokeDasharray={`${todayStats.completionPercentage * 1.26} 126`}
                                            strokeLinecap="round"
                                            strokeWidth="4"
                                        />
                                    </svg>
                                    <CheckCircle2 className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-5 w-5 text-emerald-500" />
                                </div>
                            </div>

                            {/* Current & Best Streak */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-secondary/50 p-2">
                                    <div className="mb-1 flex items-center gap-1 text-muted-foreground text-xs">
                                        <Flame className="h-3 w-3 text-orange-500" />
                                        <span>Current streak</span>
                                        <InfoTooltip content="Consecutive days where you completed all your habits. Missing a day resets the streak to 0." />
                                    </div>
                                    <span className="font-bold text-lg">
                                        {stats.currentStreak} days
                                    </span>
                                </div>
                                <div className="rounded-lg bg-secondary/50 p-2">
                                    <div className="mb-1 flex items-center gap-1 text-muted-foreground text-xs">
                                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                                        <span>Best streak</span>
                                        <InfoTooltip content="Your longest ever streak of consecutive days with all habits completed." />
                                    </div>
                                    <span className="font-bold text-lg">
                                        {stats.longestStreak} days
                                    </span>
                                </div>
                            </div>

                            {/* Top Habits */}
                            <div className="space-y-2 border-border/50 border-t pt-2">
                                {displayHabits.map((habit) => (
                                    <div
                                        className="flex items-center gap-2 text-sm"
                                        key={habit.id}
                                    >
                                        <span className="shrink-0 text-base">
                                            {habit.emoji || "📌"}
                                        </span>
                                        <span className="flex-1 truncate font-medium">
                                            {habit.title}
                                        </span>
                                        {habit.calculatedStreak > 0 && (
                                            <span
                                                className={cn(
                                                    "shrink-0 rounded px-1.5 py-0.5 font-medium text-xs",
                                                    habit.calculatedStreak >= 7
                                                        ? "bg-emerald-500/10 text-emerald-500"
                                                        : "bg-secondary text-muted-foreground"
                                                )}
                                            >
                                                🔥 {habit.calculatedStreak}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Weekly Activity Mini Chart */}
                            {recentActivity.length > 0 && (
                                <div className="border-border/50 border-t pt-2">
                                    <div className="mb-2 flex items-center gap-1 text-muted-foreground text-xs">
                                        <span>This week</span>
                                        <InfoTooltip content="Daily completion rate for the past 7 days. Darker green = higher completion percentage." />
                                    </div>
                                    <div className="flex justify-between gap-1">
                                        {recentActivity
                                            .slice(-7)
                                            .map((day, i) => (
                                                <div
                                                    className="flex flex-1 flex-col items-center gap-1"
                                                    key={i}
                                                >
                                                    <div
                                                        className={cn(
                                                            "h-8 w-full rounded-sm",
                                                            (() => {
                                                                if (
                                                                    day.completionPercentage >=
                                                                    80
                                                                ) {
                                                                    return "bg-emerald-500";
                                                                }
                                                                if (
                                                                    day.completionPercentage >=
                                                                    50
                                                                ) {
                                                                    return "bg-emerald-500/50";
                                                                }
                                                                if (
                                                                    day.completionPercentage >
                                                                    0
                                                                ) {
                                                                    return "bg-emerald-500/20";
                                                                }
                                                                return "bg-secondary";
                                                            })()
                                                        )}
                                                    />
                                                    <span className="text-[9px] text-muted-foreground">
                                                        {new Date(
                                                            day.date
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                weekday:
                                                                    "narrow",
                                                            }
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-[180px] flex-col items-center justify-center text-muted-foreground">
                            <CheckCircle2 className="mb-3 h-10 w-10 opacity-20" />
                            <span className="font-medium text-sm">
                                No habits yet
                            </span>
                            <span className="mt-1 text-center text-xs opacity-70">
                                Create your first habit to start tracking
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
