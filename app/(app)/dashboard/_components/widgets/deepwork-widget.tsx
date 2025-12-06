"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BrainCircuit, Flame, Target, InfoIcon, Timer, Zap, Trophy } from "lucide-react";
import type { RouterOutput } from "@/orpc/client";
import { cn } from "@/lib/utils";

interface DeepworkWidgetProps {
    profileStats: RouterOutput["profile"]["getUserStats"];
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

function formatTime(minutes: number): { value: string; unit: string } {
    if (minutes < 60) return { value: String(minutes), unit: 'min' };
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) {
        return mins > 0
            ? { value: `${hours}h ${mins}`, unit: 'min' }
            : { value: String(hours), unit: 'hrs' };
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return { value: `${days}d ${remainingHours}`, unit: 'hrs' };
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function DeepworkWidget({ profileStats }: DeepworkWidgetProps) {
    const { deepwork } = profileStats;

    const totalFocusTime = deepwork.totalWorkTime;
    const totalSessions = deepwork.totalSessions;
    const totalCompleted = deepwork.completedSessions;
    const completionRate = totalSessions > 0 ? (totalCompleted / totalSessions) * 100 : 0;

    // Average session duration (only for completed sessions)
    const avgSessionDuration = totalCompleted > 0
        ? Math.round(totalFocusTime / totalCompleted)
        : 0;

    const hasData = totalSessions > 0;

    // Calculate productivity score (0-100)
    const productivityScore = (() => {
        if (!hasData) return 0;
        // Factors: completion rate (40%), avg duration vs target 45min (30%), total time (30%)
        const completionScore = completionRate * 0.4;
        const durationScore = Math.min((avgSessionDuration / 45) * 100, 100) * 0.3;
        const timeScore = Math.min((totalFocusTime / 600) * 100, 100) * 0.3; // 10 hours target 
        return completionScore + durationScore + timeScore;
    })();

    const formattedTime = formatTime(totalFocusTime);

    return (
        <TooltipProvider delayDuration={100}>
            <Card className="h-full border-none bg-white dark:bg-secondary/20 shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        Deepwork
                        <InfoTooltip content="Track your deep work sessions started via Discord. Measures long uninterrupted focus periods to improve productivity." />
                    </CardTitle>
                    {hasData && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full cursor-help",
                                    productivityScore >= 70 ? "bg-emerald-500/10 text-emerald-500" :
                                        productivityScore >= 40 ? "bg-amber-500/10 text-amber-500" :
                                            "bg-secondary text-muted-foreground"
                                )}>
                                    <Zap className="w-3 h-3" />
                                    {productivityScore.toFixed(0)}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[220px] text-xs leading-relaxed">
                                <p className="font-semibold mb-1">Productivity Score</p>
                                <p>Calculated from: completion rate (40%), average duration vs 45min target (30%), and total time vs 10h target (30%).</p>
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
                                        <span className="text-3xl font-bold text-foreground">
                                            {formattedTime.value}
                                        </span>
                                        <span className="text-sm text-muted-foreground">{formattedTime.unit}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Total focus time</span>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="h-14 w-14 rounded-full bg-violet-500/10 flex items-center justify-center relative cursor-help">
                                            <BrainCircuit className="w-7 h-7 text-violet-500" />
                                            {/* Circular progress */}
                                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                <circle
                                                    cx="28"
                                                    cy="28"
                                                    r="24"
                                                    fill="none"
                                                    strokeWidth="3"
                                                    stroke="currentColor"
                                                    className="text-violet-500/20"
                                                />
                                                <circle
                                                    cx="28"
                                                    cy="28"
                                                    r="24"
                                                    fill="none"
                                                    strokeWidth="3"
                                                    stroke="currentColor"
                                                    strokeDasharray={`${completionRate * 1.51} 151`}
                                                    strokeLinecap="round"
                                                    className="text-violet-500"
                                                />
                                            </svg>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        {completionRate.toFixed(0)}% completion rate
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="bg-secondary/50 rounded-lg p-2.5 text-center cursor-help">
                                            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                                <Target className="w-3 h-3" />
                                            </div>
                                            <span className="text-lg font-bold block">{totalSessions}</span>
                                            <span className="text-[10px] text-muted-foreground">Sessions</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        Total deepwork sessions started (both completed and incomplete)
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="bg-secondary/50 rounded-lg p-2.5 text-center cursor-help">
                                            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                                <Flame className="w-3 h-3" />
                                            </div>
                                            <span className="text-lg font-bold block text-emerald-500">{completionRate.toFixed(0)}%</span>
                                            <span className="text-[10px] text-muted-foreground">Completed</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        {totalCompleted} of {totalSessions} sessions completed without interruption
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="bg-secondary/50 rounded-lg p-2.5 text-center cursor-help">
                                            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                                <Timer className="w-3 h-3" />
                                            </div>
                                            <span className="text-lg font-bold block">{avgSessionDuration}m</span>
                                            <span className="text-[10px] text-muted-foreground">Avg Duration</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        Average time per completed session. Target: 45+ minutes for deep work
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            {/* Session Progress */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-muted-foreground">Session completion</span>
                                        <InfoTooltip content="Percentage of sessions you completed without interruption. Higher is better - shows your ability to maintain focus." />
                                    </div>
                                    <span className="text-xs font-medium">{totalCompleted}/{totalSessions}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-violet-500 transition-all rounded-full"
                                        style={{ width: `${completionRate}%` }}
                                    />
                                </div>
                            </div>

                            {/* Best Performance */}
                            <div className="pt-2 border-t border-border/50 space-y-2">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Trophy className="w-3 h-3 text-amber-500" />
                                    Best performances
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 cursor-help">
                                                <span className="text-xs text-muted-foreground">Longest</span>
                                                <span className="text-sm font-bold text-violet-500">
                                                    {formatDuration(deepwork.longestSession || 0)}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-xs">
                                            Your longest single deepwork session ever completed
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 cursor-help">
                                                <span className="text-xs text-muted-foreground">Average</span>
                                                <span className="text-sm font-bold">
                                                    {formatDuration(deepwork.averageSessionDuration || 0)}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-xs">
                                            Average duration of all your deepwork sessions
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Weekly Goal Progress */}
                            <div className="pt-2 border-t border-border/50">
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground">Weekly goal</span>
                                        <InfoTooltip content="Track your progress towards 10 hours of deep work per week. Consistent deep work leads to better results." />
                                    </div>
                                    <span className="font-medium">{formatDuration(totalFocusTime)} / 10h</span>
                                </div>
                                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-linear-to-r from-violet-500 to-violet-400 rounded-full transition-all"
                                        style={{ width: `${Math.min((totalFocusTime / 600) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
                            <div className="relative">
                                <BrainCircuit className="w-12 h-12 mb-3 opacity-20" />
                                <Zap className="w-5 h-5 absolute -top-1 -right-1 text-violet-500/30" />
                            </div>
                            <span className="text-sm font-medium">No deepwork sessions yet</span>
                            <span className="text-xs text-center mt-1 opacity-70 max-w-[200px]">
                                Start a Deepwork session via Discord to track your focus time
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
