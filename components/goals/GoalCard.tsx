"use client";

import {
    RiAwardLine,
    RiCalendarLine,
    RiCheckboxCircleFill,
    RiCircleLine,
    RiDeleteBinLine,
    RiEditLine,
    RiTargetLine,
    RiTimeLine,
} from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";
import type { Goal } from "@/server/db/schema";
import { GoalReminders } from "./GoalReminders";

interface GoalCardProps {
    goal: Goal;
    viewMode: "grid" | "list";
    onGoalChange?: () => void;
    onEditGoal?: (goal: Goal) => void;
}

export function GoalCard({
    goal,
    viewMode,
    onGoalChange,
    onEditGoal,
}: GoalCardProps) {
    const { mutateAsync: markCompleted, isPending: isMarkingCompleted } =
        useMutation(
            orpc.goals.markCompleted.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.goals.getPaginated.queryKey({ input: {} }),
                        orpc.goals.getStats.queryKey({ input: {} }),
                        orpc.goals.getAll.queryKey({ input: {} }),
                    ],
                },
                onSuccess: () => {
                    onGoalChange?.();
                },
            })
        );

    const { mutateAsync: deleteGoal } = useMutation(
        orpc.goals.delete.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.goals.getPaginated.queryKey({ input: {} }),
                    orpc.goals.getStats.queryKey({ input: {} }),
                    orpc.goals.getAll.queryKey({ input: {} }),
                ],
            },
            onSuccess: () => {
                onGoalChange?.();
            },
        })
    );

    const isOverdue =
        goal.deadline &&
        new Date(goal.deadline) < new Date() &&
        !goal.isCompleted;

    const getStatusColor = () => {
        if (goal.isCompleted) {
            return "bg-green-500/30 text-green-400 border-green-500/50 shadow-lg shadow-green-500/20";
        }
        if (isOverdue) {
            return "bg-red-500/20 text-red-400 border-red-500/30";
        }
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    };

    const getGoalIcon = () => {
        if (goal.isCompleted) {
            return <RiAwardLine className="size-5" />;
        }
        if (isOverdue) {
            return <RiTimeLine className="size-5" />;
        }
        return <RiTargetLine className="size-5" />;
    };

    const handleMarkCompleted = async () => {
        await markCompleted({
            id: goal.id,
            isCompleted: !goal.isCompleted,
        });
    };

    const handleDelete = () => {
        deleteGoal({ id: goal.id });
    };

    if (viewMode === "list") {
        return (
            <div className="group relative rounded-xl border border-white/10 bg-white/3 p-6 backdrop-blur-xs transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
                <div className="absolute inset-0 rounded-xl bg-linear-to-r from-white/5 via-white/10 to-white/5 opacity-0 blur-xs transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex items-center justify-between">
                    <div className="flex flex-1 items-center gap-4">
                        <button
                            className="group/button shrink-0"
                            disabled={isMarkingCompleted}
                            onClick={handleMarkCompleted}
                            type="button"
                        >
                            {goal.isCompleted ? (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-green-400/40 bg-linear-to-br from-green-500/30 to-green-400/20 shadow-green-500/20 shadow-lg transition-transform duration-300 group-hover/button:scale-110">
                                    <RiCheckboxCircleFill className="size-4 text-green-400" />
                                </div>
                            ) : (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-all duration-300 hover:border-green-400/40 hover:bg-green-500/10 group-hover/button:scale-110">
                                    <RiCircleLine className="size-4 text-white/60 group-hover/button:text-green-400" />
                                </div>
                            )}
                        </button>

                        <div className="min-w-0 flex-1">
                            <h3
                                className={`wrap-break-word mb-2 line-clamp-2 font-semibold text-lg ${goal.isCompleted ? "text-green-400/60 line-through" : "text-white"} transition-all duration-300`}
                                title={goal.title}
                            >
                                {goal.title}
                            </h3>
                            <div className="mb-2 flex items-center gap-2">
                                <Badge
                                    className={`text-xs ${getStatusColor()}`}
                                >
                                    {goal.isCompleted
                                        ? "Completed"
                                        : isOverdue
                                          ? "Overdue"
                                          : "Active"}
                                </Badge>
                            </div>

                            {goal.description && (
                                <p
                                    className={`text-sm ${goal.isCompleted ? "text-green-400/40" : "text-white/60"} line-clamp-2`}
                                >
                                    {goal.description}
                                </p>
                            )}

                            {goal.deadline && (
                                <div className="mt-2 flex items-center gap-2">
                                    <RiCalendarLine className="size-4 text-white/40" />
                                    <span
                                        className={`text-sm ${isOverdue ? "text-white/60" : "text-white/40"}`}
                                    >
                                        Due:{" "}
                                        {new Date(
                                            goal.deadline
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            className="text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white"
                            onClick={() => onEditGoal?.(goal)}
                            size="sm"
                            variant="ghost"
                        >
                            <RiEditLine className="size-4" />
                        </Button>
                        <Button
                            className="text-white/60 transition-all duration-300 hover:bg-red-400/10 hover:text-red-400"
                            onClick={handleDelete}
                            size="sm"
                            variant="ghost"
                        >
                            <RiDeleteBinLine className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/3 p-6 backdrop-blur-xs transition-all duration-300 hover:scale-105 hover:border-white/20">
            <div className="absolute inset-0 bg-linear-to-br from-white/5 via-white/10 to-white/5 opacity-0 blur-xs transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-linear-to-br from-white/10 to-white/5 transition-transform duration-300 group-hover:scale-110">
                            <div className="text-white/80">{getGoalIcon()}</div>
                        </div>
                        <div className="flex gap-2">
                            <Badge className={`text-xs ${getStatusColor()}`}>
                                {goal.isCompleted
                                    ? "Done"
                                    : isOverdue
                                      ? "Late"
                                      : "Active"}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            className="text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white"
                            onClick={() => onEditGoal?.(goal)}
                            size="sm"
                            variant="ghost"
                        >
                            <RiEditLine className="size-4" />
                        </Button>
                        <Button
                            className="text-white/60 transition-all duration-300 hover:bg-red-400/10 hover:text-red-400"
                            onClick={handleDelete}
                            size="sm"
                            variant="ghost"
                        >
                            <RiDeleteBinLine className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="mb-4">
                    <h3
                        className={`wrap-break-word mb-2 line-clamp-3 font-semibold text-lg ${goal.isCompleted ? "text-green-400/60 line-through" : "text-white"} transition-all duration-300`}
                        title={goal.title}
                    >
                        {goal.title}
                    </h3>
                    {goal.description && (
                        <p
                            className={`wrap-break-word text-sm ${goal.isCompleted ? "text-green-400/40" : "text-white/60"} line-clamp-2`}
                            title={goal.description}
                        >
                            {goal.description}
                        </p>
                    )}
                </div>

                <div className="space-y-4 border-white/10 border-t pt-4">
                    <GoalReminders
                        currentFrequency={
                            goal.reminderFrequency as
                                | "daily"
                                | "weekly"
                                | "monthly"
                                | null
                        }
                        goalId={goal.id}
                        isActive={goal.isActive}
                        nextReminderDate={goal.nextReminderDate}
                    />

                    <div className="flex items-center justify-between">
                        {goal.deadline && (
                            <div className="flex items-center gap-2">
                                <RiCalendarLine className="size-4 text-white/40" />
                                <span
                                    className={`text-sm ${isOverdue ? "text-white/60" : "text-white/40"}`}
                                >
                                    {new Date(
                                        goal.deadline
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        <button
                            className={cn(
                                "group/button flex items-center gap-2 rounded-lg border px-4 py-2 transition-all duration-300",
                                goal.isCompleted
                                    ? "border-green-400/40 bg-green-500/20 hover:border-green-400/60 hover:bg-green-500/30"
                                    : "border-white/10 bg-white/5 hover:border-green-400/40 hover:bg-green-500/10"
                            )}
                            disabled={isMarkingCompleted}
                            onClick={handleMarkCompleted}
                            type="button"
                        >
                            {goal.isCompleted ? (
                                <>
                                    <RiCheckboxCircleFill className="size-4 text-green-400" />
                                    <span className="text-green-400 text-sm">
                                        Done
                                    </span>
                                </>
                            ) : (
                                <>
                                    <RiCircleLine className="size-4 text-white/60 transition-colors group-hover/button:text-green-400" />
                                    <span className="text-sm text-white/60 transition-colors group-hover/button:text-green-400">
                                        Complete
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
