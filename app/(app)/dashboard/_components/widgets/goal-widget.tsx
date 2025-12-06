"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, Target, Trophy, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import type { RouterOutput } from "@/orpc/client";
import { cn } from "@/lib/utils";

interface GoalWidgetProps {
    goals: RouterOutput["goals"]["getAll"];
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

function getTypeColor(type: string) {
    switch (type.toLowerCase()) {
        case 'annual': return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
        case 'quarterly': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'monthly': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'weekly': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        default: return 'bg-secondary text-muted-foreground border-border';
    }
}

function getDaysRemaining(deadline: Date | null): { text: string; isUrgent: boolean; isOverdue: boolean } {
    if (!deadline) return { text: 'No deadline', isUrgent: false, isOverdue: false };

    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: `${Math.abs(days)}d overdue`, isUrgent: true, isOverdue: true };
    if (days === 0) return { text: 'Due today', isUrgent: true, isOverdue: false };
    if (days === 1) return { text: 'Due tomorrow', isUrgent: true, isOverdue: false };
    if (days <= 7) return { text: `${days}d left`, isUrgent: true, isOverdue: false };
    if (days <= 30) return { text: `${days}d left`, isUrgent: false, isOverdue: false };
    return { text: `${Math.floor(days / 30)}mo left`, isUrgent: false, isOverdue: false };
}

export function GoalWidget({ goals }: GoalWidgetProps) {
    const activeGoals = goals.filter(g => !g.completedAt && g.isActive);
    const completedGoals = goals.filter(g => g.completedAt);
    const displayGoals = activeGoals.slice(0, 4);

    // Stats calculation
    const totalGoals = goals.length;
    const completionRate = totalGoals > 0 ? (completedGoals.length / totalGoals) * 100 : 0;

    // Count goals by type
    const goalsByType = activeGoals.reduce((acc, goal) => {
        acc[goal.type] = (acc[goal.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Count urgent goals (deadline within 7 days)
    const urgentCount = activeGoals.filter(g => {
        if (!g.deadline) return false;
        const days = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days <= 7 && days >= 0;
    }).length;

    const hasGoals = goals.length > 0;

    return (
        <TooltipProvider delayDuration={100}>
            <Card className="h-full border-none bg-white dark:bg-secondary/20 shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        Goals
                        <InfoTooltip content="Track your short and long-term objectives. Goals can be annual, quarterly, monthly, or weekly with optional deadlines and progress tracking." />
                    </CardTitle>
                    {completedGoals.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                            <Trophy className="w-3 h-3" />
                            {completedGoals.length}
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {hasGoals ? (
                        <div className="space-y-4">
                            {/* Stats Row */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold">{activeGoals.length}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</span>
                                    </div>
                                    {urgentCount > 0 && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg cursor-help">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-medium">{urgentCount} urgent</span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">
                                                Goals with deadlines within 7 days
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="text-right cursor-help">
                                            <span className="text-lg font-bold text-emerald-500">{completionRate.toFixed(0)}%</span>
                                            <span className="text-[10px] text-muted-foreground block">completed</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        {completedGoals.length} of {totalGoals} goals completed
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            {/* Goals List */}
                            <div className="space-y-2">
                                {displayGoals.map((goal) => {
                                    const deadlineInfo = getDaysRemaining(goal.deadline ? new Date(goal.deadline) : null);
                                    const progress = goal.targetValue && goal.currentValue
                                        ? Math.min((Number(goal.currentValue) / Number(goal.targetValue)) * 100, 100)
                                        : 0;

                                    return (
                                        <div
                                            key={goal.id}
                                            className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                        >
                                            {/* Status Icon */}
                                            <div className={cn(
                                                "mt-0.5 shrink-0",
                                                progress >= 100 ? "text-emerald-500" : "text-muted-foreground/40"
                                            )}>
                                                {progress >= 100 ? (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                ) : (
                                                    <Circle className="w-4 h-4" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="text-sm font-medium truncate">{goal.title}</span>
                                                    <span className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded border shrink-0",
                                                        getTypeColor(goal.type)
                                                    )}>
                                                        {goal.type}
                                                    </span>
                                                </div>

                                                {/* Progress & Deadline */}
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    {goal.targetValue && (
                                                        <span className="text-xs text-muted-foreground">
                                                            <span className="font-medium text-foreground">{goal.currentValue || 0}</span>
                                                            <span className="mx-0.5">/</span>
                                                            <span>{goal.targetValue}</span>
                                                            {goal.unit && <span className="ml-0.5">{goal.unit}</span>}
                                                        </span>
                                                    )}
                                                    {goal.deadline && (
                                                        <span className={cn(
                                                            "text-[10px] flex items-center gap-1",
                                                            deadlineInfo.isOverdue ? "text-rose-500" :
                                                                deadlineInfo.isUrgent ? "text-amber-500" :
                                                                    "text-muted-foreground"
                                                        )}>
                                                            <Clock className="w-3 h-3" />
                                                            {deadlineInfo.text}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Type Summary */}
                            {Object.keys(goalsByType).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
                                    {Object.entries(goalsByType).map(([type, count]) => (
                                        <span
                                            key={type}
                                            className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full border font-medium",
                                                getTypeColor(type)
                                            )}
                                        >
                                            {count} {type}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* More indicator */}
                            {activeGoals.length > 4 && (
                                <div className="text-xs text-center text-muted-foreground">
                                    +{activeGoals.length - 4} more
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                            <Target className="w-10 h-10 mb-3 opacity-20" />
                            <span className="text-sm font-medium">No goals yet</span>
                            <span className="text-xs text-center mt-1 opacity-70">
                                Set your first goal to start tracking
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
