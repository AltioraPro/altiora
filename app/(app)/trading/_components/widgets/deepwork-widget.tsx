"use client";

import {
    BrainCircuit,
    Flame,
    InfoIcon,
    Target,
    Timer,
    Trophy,
    Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RouterOutput } from "@/orpc/client";

interface DeepworkWidgetProps {
    profileStats: RouterOutput["profile"]["getUserStats"];
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

function formatTime(minutes: number): { value: string; unit: string } {
    if (minutes < 60) {
        return { value: String(minutes), unit: "min" };
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) {
        return mins > 0
            ? { value: `${hours}h ${mins}`, unit: "min" }
            : { value: String(hours), unit: "hrs" };
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return { value: `${days}d ${remainingHours}`, unit: "hrs" };
}

function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function DeepworkWidget({ profileStats }: DeepworkWidgetProps) {
    const { deepwork } = profileStats;

    const totalFocusTime = deepwork.totalWorkTime;
    const totalSessions = deepwork.totalSessions;
    const totalCompleted = deepwork.completedSessions;
    const completionRate =
        totalSessions > 0 ? (totalCompleted / totalSessions) * 100 : 0;

    // Average session duration (only for completed sessions)
    const avgSessionDuration =
        totalCompleted > 0 ? Math.round(totalFocusTime / totalCompleted) : 0;

    const hasData = totalSessions > 0;

    // Calculate productivity score (0-100)
    const productivityScore = (() => {
        if (!hasData) {
            return 0;
        }
        // Factors: completion rate (40%), avg duration vs target 45min (30%), total time (30%)
        const completionScore = completionRate * 0.4;
        const durationScore =
            Math.min((avgSessionDuration / 45) * 100, 100) * 0.3;
        const timeScore = Math.min((totalFocusTime / 600) * 100, 100) * 0.3; // 10 hours target
        return completionScore + durationScore + timeScore;
    })();

    const formattedTime = formatTime(totalFocusTime);

    return (
        <TooltipProvider delayDuration={100}>
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2 font-medium text-base">
                        Deepwork
                        <InfoTooltip content="Track your deep work sessions started via Discord. Measures long uninterrupted focus periods to improve productivity." />
                    </CardTitle>
                    {hasData && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className={cn(
                                        "flex cursor-help items-center gap-1.5 rounded-full px-2 py-1 font-medium text-xs",
                                        (() => {
                                            if (productivityScore >= 70) {
                                                return "bg-emerald-500/10 text-emerald-500";
                                            }
                                            if (productivityScore >= 40) {
                                                return "bg-amber-500/10 text-amber-500";
                                            }
                                            return "bg-secondary text-muted-foreground";
                                        })()
                                    )}
                                >
                                    <Zap className="h-3 w-3" />
                                    {productivityScore.toFixed(0)}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[220px] text-xs leading-relaxed">
                                <p className="mb-1 font-semibold">
                                    Productivity Score
                                </p>
                                <p>
                                    Calculated from: completion rate (40%),
                                    average duration vs 45min target (30%), and
                                    total time vs 10h target (30%).
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </CardHeader>
                <CardContent>
                    {hasData ? (
                        <div className="space-y-4">
                            {/* Main Stats */}
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-bold text-3xl text-foreground">
                                            {formattedTime.value}
                                        </span>
                                        <span className="text-muted-foreground text-sm">
                                            {formattedTime.unit}
                                        </span>
                                    </div>
                                    <span className="text-muted-foreground text-xs">
                                        Total focus time
                                    </span>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="relative flex h-14 w-14 cursor-help items-center justify-center rounded-full bg-violet-500/10">
                                            <BrainCircuit className="h-7 w-7 text-violet-500" />
                                            {/* Circular progress */}
                                            <svg className="-rotate-90 absolute inset-0 h-full w-full">
                                                <title>
                                                    Completion rate progress
                                                </title>
                                                <circle
                                                    className="text-violet-500/20"
                                                    cx="28"
                                                    cy="28"
                                                    fill="none"
                                                    r="24"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                />
                                                <circle
                                                    className="text-violet-500"
                                                    cx="28"
                                                    cy="28"
                                                    fill="none"
                                                    r="24"
                                                    stroke="currentColor"
                                                    strokeDasharray={`${completionRate * 1.51} 151`}
                                                    strokeLinecap="round"
                                                    strokeWidth="3"
                                                />
                                            </svg>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        {completionRate.toFixed(0)}% completion
                                        rate
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-help rounded-lg bg-secondary/50 p-2.5 text-center">
                                            <div className="mb-1 flex items-center justify-center gap-1 text-muted-foreground">
                                                <Target className="h-3 w-3" />
                                            </div>
                                            <span className="block font-bold text-lg">
                                                {totalSessions}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                Sessions
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        Total deepwork sessions started (both
                                        completed and incomplete)
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-help rounded-lg bg-secondary/50 p-2.5 text-center">
                                            <div className="mb-1 flex items-center justify-center gap-1 text-muted-foreground">
                                                <Flame className="h-3 w-3" />
                                            </div>
                                            <span className="block font-bold text-emerald-500 text-lg">
                                                {completionRate.toFixed(0)}%
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                Completed
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        {totalCompleted} of {totalSessions}{" "}
                                        sessions completed without interruption
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-help rounded-lg bg-secondary/50 p-2.5 text-center">
                                            <div className="mb-1 flex items-center justify-center gap-1 text-muted-foreground">
                                                <Timer className="h-3 w-3" />
                                            </div>
                                            <span className="block font-bold text-lg">
                                                {avgSessionDuration}m
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                Avg Duration
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        Average time per completed session.
                                        Target: 45+ minutes for deep work
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            {/* Session Progress */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground text-xs">
                                            Session completion
                                        </span>
                                        <InfoTooltip content="Percentage of sessions you completed without interruption. Higher is better - shows your ability to maintain focus." />
                                    </div>
                                    <span className="font-medium text-xs">
                                        {totalCompleted}/{totalSessions}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full rounded-full bg-violet-500 transition-all"
                                        style={{ width: `${completionRate}%` }}
                                    />
                                </div>
                            </div>

                            {/* Best Performance */}
                            <div className="space-y-2 border-border/50 border-t pt-2">
                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                    <Trophy className="h-3 w-3 text-amber-500" />
                                    Best performances
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex cursor-help items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                                                <span className="text-muted-foreground text-xs">
                                                    Longest
                                                </span>
                                                <span className="font-bold text-sm text-violet-500">
                                                    {formatDuration(
                                                        deepwork.longestSession ||
                                                            0
                                                    )}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-xs">
                                            Your longest single deepwork session
                                            ever completed
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex cursor-help items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                                                <span className="text-muted-foreground text-xs">
                                                    Average
                                                </span>
                                                <span className="font-bold text-sm">
                                                    {formatDuration(
                                                        deepwork.averageSessionDuration ||
                                                            0
                                                    )}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-xs">
                                            Average duration of all your
                                            deepwork sessions
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Weekly Goal Progress */}
                            <div className="border-border/50 border-t pt-2">
                                <div className="mb-2 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground">
                                            Weekly goal
                                        </span>
                                        <InfoTooltip content="Track your progress towards 10 hours of deep work per week. Consistent deep work leads to better results." />
                                    </div>
                                    <span className="font-medium">
                                        {formatDuration(totalFocusTime)} / 10h
                                    </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full rounded-full bg-linear-to-r from-violet-500 to-violet-400 transition-all"
                                        style={{
                                            width: `${Math.min((totalFocusTime / 600) * 100, 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground">
                            <div className="relative">
                                <BrainCircuit className="mb-3 h-12 w-12 opacity-20" />
                                <Zap className="-top-1 -right-1 absolute h-5 w-5 text-violet-500/30" />
                            </div>
                            <span className="font-medium text-sm">
                                No deepwork sessions yet
                            </span>
                            <span className="mt-1 max-w-[200px] text-center text-xs opacity-70">
                                Start a Deepwork session via Discord to track
                                your focus time
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
