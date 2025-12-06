"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, Flame, TrendingUp, CheckCircle2 } from "lucide-react";
import type { RouterOutput } from "@/orpc/client";
import { cn } from "@/lib/utils";

interface HabitWidgetProps {
    data: RouterOutput["habits"]["getDashboard"];
}

function InfoTooltip({ content }: { content: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <InfoIcon className="w-3.5 h-3.5 text-muted-foreground opacity-50 cursor-help hover:opacity-100 transition-opacity" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px] text-xs leading-relaxed">
                {content}
            </TooltipContent>
        </Tooltip>
    );
}

// Calculate streak from completions
function calculateHabitStreak(completions: { completionDate: string; isCompleted: boolean }[]): number {
    if (!completions || completions.length === 0) return 0;

    // Sort completions by date descending
    const sorted = [...completions]
        .filter(c => c.isCompleted)
        .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());

    if (sorted.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const completion of sorted) {
        const completionDate = new Date(completion.completionDate);
        completionDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - streak);

        // Allow for today or yesterday as valid streak continuation
        const diffDays = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

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
    const habitsWithStreak = habits.map(habit => ({
        ...habit,
        calculatedStreak: calculateHabitStreak(habit.completions)
    }));

    // Take top 3 habits sorted by streak
    const displayHabits = [...habitsWithStreak]
        .sort((a, b) => b.calculatedStreak - a.calculatedStreak)
        .slice(0, 3);

    const hasHabits = habits.length > 0;

    return (
        <TooltipProvider delayDuration={100}>
            <Card className="h-full border-none bg-white dark:bg-secondary/20 shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        Habits
                        <InfoTooltip content="Track your daily habits and build consistent routines. The completion rate shows how many habits you've checked off today." />
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                        Today
                    </div>
                </CardHeader>
                <CardContent>
                    {hasHabits ? (
                        <div className="space-y-4">
                            {/* Today's Progress */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-foreground">
                                        {todayStats.completionPercentage.toFixed(0)}%
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {todayStats.completedHabits}/{todayStats.totalHabits} completed
                                    </span>
                                </div>
                                <div className="relative h-12 w-12">
                                    <svg className="w-12 h-12 transform -rotate-90">
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                            className="text-secondary"
                                        />
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeDasharray={`${todayStats.completionPercentage * 1.26} 126`}
                                            className="text-emerald-500"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                            </div>

                            {/* Current & Best Streak */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-secondary/50 rounded-lg p-2">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                        <Flame className="w-3 h-3 text-orange-500" />
                                        <span>Current streak</span>
                                        <InfoTooltip content="Consecutive days where you completed all your habits. Missing a day resets the streak to 0." />
                                    </div>
                                    <span className="text-lg font-bold">{stats.currentStreak} days</span>
                                </div>
                                <div className="bg-secondary/50 rounded-lg p-2">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                                        <span>Best streak</span>
                                        <InfoTooltip content="Your longest ever streak of consecutive days with all habits completed." />
                                    </div>
                                    <span className="text-lg font-bold">{stats.longestStreak} days</span>
                                </div>
                            </div>

                            {/* Top Habits */}
                            <div className="space-y-2 pt-2 border-t border-border/50">
                                {displayHabits.map((habit) => (
                                    <div key={habit.id} className="flex items-center gap-2 text-sm">
                                        <span className="text-base shrink-0">{habit.emoji || "📌"}</span>
                                        <span className="flex-1 truncate font-medium">{habit.title}</span>
                                        {habit.calculatedStreak > 0 && (
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded font-medium text-xs shrink-0",
                                                habit.calculatedStreak >= 7 ? "bg-emerald-500/10 text-emerald-500" : "bg-secondary text-muted-foreground"
                                            )}>
                                                🔥 {habit.calculatedStreak}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Weekly Activity Mini Chart */}
                            {recentActivity.length > 0 && (
                                <div className="pt-2 border-t border-border/50">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                        <span>This week</span>
                                        <InfoTooltip content="Daily completion rate for the past 7 days. Darker green = higher completion percentage." />
                                    </div>
                                    <div className="flex justify-between gap-1">
                                        {recentActivity.slice(-7).map((day, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                <div
                                                    className={cn(
                                                        "w-full h-8 rounded-sm",
                                                        day.completionPercentage >= 80 ? "bg-emerald-500" :
                                                            day.completionPercentage >= 50 ? "bg-emerald-500/50" :
                                                                day.completionPercentage > 0 ? "bg-emerald-500/20" :
                                                                    "bg-secondary"
                                                    )}
                                                ></div>
                                                <span className="text-[9px] text-muted-foreground">
                                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
                            <CheckCircle2 className="w-10 h-10 mb-3 opacity-20" />
                            <span className="text-sm font-medium">No habits yet</span>
                            <span className="text-xs text-center mt-1 opacity-70">
                                Create your first habit to start tracking
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
