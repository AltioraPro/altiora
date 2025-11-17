"use client";

import {
    RiCalendarLine,
    RiCheckboxCircleFill,
    RiCircleLine,
    RiDeleteBin2Line,
    RiEditLine,
    RiSearchLine,
    RiSparklingLine,
    RiStockLine,
} from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";
import type { Goal } from "@/server/db/schema";
import { EditGoalModal } from "./EditGoalModal";
import { GoalFilters } from "./GoalFilters";
import { GoalStats } from "./GoalStats";

function QuarterlyGoalItem({
    goal,
    onGoalChange,
    onEditGoal,
}: {
    goal: Goal;
    onGoalChange?: () => void;
    onEditGoal?: (goal: Goal) => void;
}) {
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

    const handleMarkCompleted = () => {
        markCompleted({
            id: goal.id,
            isCompleted: !goal.isCompleted,
        });
    };

    const handleDelete = () => {
        deleteGoal({ id: goal.id });
    };

    return (
        <div className="group relative mb-4 rounded-lg border border-white/5 bg-white/2 p-5 transition-all duration-200 hover:border-white/10 hover:bg-white/4">
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                        <button
                            className="shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                            disabled={isMarkingCompleted}
                            onClick={handleMarkCompleted}
                            type="button"
                        >
                            {goal.isCompleted ? (
                                <RiCheckboxCircleFill className="size-4 text-green-400" />
                            ) : (
                                <RiCircleLine className="size-4 text-white/40 transition-colors hover:text-green-400" />
                            )}
                        </button>

                        <h4
                            className={`wrap-break-word line-clamp-1 font-medium text-sm ${goal.isCompleted ? "text-white/50 line-through" : "text-white/90"}`}
                            title={goal.title}
                        >
                            {goal.title}
                        </h4>
                    </div>

                    <div className="flex items-center gap-4 text-white/50 text-xs">
                        {goal.deadline && (
                            <div className="flex items-center gap-1">
                                <RiCalendarLine className="size-3" />
                                <span>
                                    {new Date(goal.deadline).toLocaleDateString(
                                        "en-US",
                                        {
                                            day: "numeric",
                                            month: "short",
                                        }
                                    )}
                                </span>
                            </div>
                        )}

                        <div
                            className={cn(
                                "size-2 rounded-full",
                                goal.isCompleted && "bg-green-400",
                                isOverdue && "bg-red-400",
                                !(goal.isCompleted || isOverdue) &&
                                    "bg-white/30"
                            )}
                        />

                        <span className="text-xs">
                            {goal.isCompleted && "Done"}
                            {isOverdue && "Overdue"}
                            {!(goal.isCompleted || isOverdue) && "Active"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button
                        className="h-6 w-6 p-0 text-white/40 hover:bg-white/5 hover:text-white/80"
                        onClick={() => onEditGoal?.(goal)}
                        size="sm"
                        variant="ghost"
                    >
                        <RiEditLine className="size-3" />
                    </Button>
                    <Button
                        className="h-6 w-6 p-0 text-white/40 hover:bg-red-400/10 hover:text-red-400"
                        onClick={handleDelete}
                        size="sm"
                        variant="ghost"
                    >
                        <RiDeleteBin2Line className="size-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function GoalsDashboard() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [filters, setFilters] = useState({
        status: "all" as "all" | "active" | "completed" | "overdue",
        type: "all" as "all" | "annual" | "quarterly" | "monthly",
        hasReminders: null as boolean | null,
    });

    useEffect(() => {
        setPage(0);
    }, []);

    const {
        data: goalsData,
        isLoading,
        error,
    } = useQuery(
        orpc.goals.getPaginated.queryOptions({
            input: {
                page,
                limit: 50,
                sortBy: "sortOrder",
                sortOrder: "asc",
                search: search || undefined,
                status: filters.status !== "all" ? filters.status : undefined,
                type: filters.type !== "all" ? filters.type : undefined,
            },
        })
    );

    const { data: stats } = useQuery(
        orpc.goals.getStats.queryOptions({
            input: {
                period: "year",
            },
        })
    );

    const handleEditGoal = (goal: Goal) => {
        setEditingGoal(goal);
    };

    const handleCloseEditModal = () => {
        setEditingGoal(null);
    };

    const organizeGoalsByType = (goals: Goal[]) => {
        const annualGoals = goals.filter((goal) => goal.type === "annual");
        const quarterlyGoals = goals.filter(
            (goal) => goal.type === "quarterly"
        );
        const monthlyGoals = goals.filter((goal) => goal.type === "monthly");

        const groupGoalsByYear = (goals: Goal[]) => {
            const grouped: Record<number, Goal[]> = {};
            for (const goal of goals) {
                if (goal.deadline) {
                    const year = new Date(goal.deadline).getFullYear();
                    if (!grouped[year]) {
                        grouped[year] = [];
                    }
                    grouped[year].push(goal);
                }
            }
            return grouped;
        };

        const groupQuarterlyGoalsByQuarter = (goals: Goal[]) => {
            const grouped: Record<string, Goal[]> = {};
            for (const goal of goals) {
                if (goal.deadline) {
                    const date = new Date(goal.deadline);
                    const year = date.getFullYear();
                    const month = date.getMonth();
                    const quarter = Math.floor(month / 3) + 1;
                    const key = `${year}-Q${quarter}`;
                    if (!grouped[key]) {
                        grouped[key] = [];
                    }
                    grouped[key].push(goal);
                }
            }
            return grouped;
        };

        const annualByYear = groupGoalsByYear(annualGoals);
        const quarterlyByQuarter = groupQuarterlyGoalsByQuarter(quarterlyGoals);
        const monthlyByYear = groupGoalsByYear(monthlyGoals);

        return { annualByYear, quarterlyByQuarter, monthlyByYear };
    };

    if (error) {
        return (
            <div className="relative rounded-xl border border-white/10 bg-white/2 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                    <RiStockLine className="size-8 text-white/40" />
                </div>
                <p className="font-medium text-red-400">Error loading goals</p>
            </div>
        );
    }

    const { annualByYear, quarterlyByQuarter, monthlyByYear } =
        organizeGoalsByType(goalsData?.goals || []);

    const renderGoals = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            className="relative animate-pulse rounded-xl border border-white/10 bg-white/3 p-6 backdrop-blur-xs"
                            key={i}
                        >
                            <div className="absolute inset-0 rounded-xl bg-linear-to-br from-white/5 to-white/10 opacity-20" />
                            <div className="relative">
                                <div className="mb-4 h-6 rounded bg-white/10" />
                                <div className="mb-3 h-4 rounded bg-white/10" />
                                <div className="mb-4 h-4 w-3/4 rounded bg-white/10" />
                                <div className="h-3 w-1/2 rounded bg-white/10" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (goalsData?.goals.length === 0) {
            return (
                <div className="relative rounded-xl border border-white/10 bg-white/2 p-12 text-center backdrop-blur-xs">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-linear-to-br from-white/10 to-white/5">
                        <RiSearchLine className="size-10 text-white/40" />
                    </div>
                    <h3 className="mb-3 font-bold text-2xl text-white">
                        No goals found
                    </h3>
                    <p className="mb-6 text-lg text-white/60">
                        {search
                            ? "Try adjusting your search terms"
                            : "Create your first goal to get started"}
                    </p>
                    {!search && (
                        <div className="flex items-center justify-center gap-2 text-white/40">
                            <RiSparklingLine className="size-5" />
                            <span className="text-sm">
                                Ready to achieve something amazing?
                            </span>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="space-y-12">
                {Object.keys(annualByYear).length > 0 && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-3xl text-white">
                                Annual Goals
                            </h2>
                            <div className="text-sm text-white/60">
                                {Object.values(annualByYear).flat().length}{" "}
                                goals
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Object.keys(annualByYear)
                                .map(Number)
                                .sort((a, b) => a - b)
                                .map((year) => (
                                    <div className="space-y-4" key={year}>
                                        <div className="flex items-center gap-4">
                                            <h3 className="font-bold text-2xl text-white/90">
                                                {year}
                                            </h3>
                                            <div className="h-px flex-1 bg-linear-to-r from-white/20 to-transparent" />
                                            <div className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/60">
                                                {annualByYear[year].length}{" "}
                                                goals
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                            {annualByYear[year]
                                                .sort((a, b) => {
                                                    if (
                                                        a.isCompleted !==
                                                        b.isCompleted
                                                    ) {
                                                        return a.isCompleted
                                                            ? 1
                                                            : -1;
                                                    }
                                                    if (
                                                        a.deadline &&
                                                        b.deadline
                                                    ) {
                                                        return (
                                                            new Date(
                                                                a.deadline
                                                            ).getTime() -
                                                            new Date(
                                                                b.deadline
                                                            ).getTime()
                                                        );
                                                    }
                                                    return 0;
                                                })
                                                .map((goal, index) => (
                                                    <div
                                                        className="fade-in-0 slide-in-from-bottom-4 animate-in"
                                                        key={goal.id}
                                                        style={{
                                                            animationDelay: `${index * 100}ms`,
                                                        }}
                                                    >
                                                        <QuarterlyGoalItem
                                                            goal={goal}
                                                            onEditGoal={() =>
                                                                handleEditGoal(
                                                                    goal
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {Object.keys(quarterlyByQuarter).length > 0 && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-3xl text-white">
                                Quarterly Goals
                            </h2>
                            <div className="text-sm text-white/60">
                                {
                                    Object.values(quarterlyByQuarter).flat()
                                        .length
                                }{" "}
                                goals
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Object.keys(quarterlyByQuarter)
                                .sort((a, b) => {
                                    const [yearA, quarterA] = a
                                        .split("-Q")
                                        .map(Number);
                                    const [yearB, quarterB] = b
                                        .split("-Q")
                                        .map(Number);
                                    if (yearA !== yearB) {
                                        return yearA - yearB;
                                    }
                                    return quarterA - quarterB;
                                })
                                .map((quarterKey) => {
                                    const [year, quarterStr] =
                                        quarterKey.split("-Q");
                                    const quarter = Number.parseInt(
                                        quarterStr,
                                        10
                                    );
                                    const quarterNames = {
                                        1: "Q1 (Jan-Mar)",
                                        2: "Q2 (Apr-Jun)",
                                        3: "Q3 (Jul-Sep)",
                                        4: "Q4 (Oct-Dec)",
                                    };

                                    return (
                                        <div
                                            className="space-y-4"
                                            key={quarterKey}
                                        >
                                            <div className="flex items-center gap-4">
                                                <h3 className="font-bold text-2xl text-white/90">
                                                    {year} -{" "}
                                                    {
                                                        quarterNames[
                                                            quarter as keyof typeof quarterNames
                                                        ]
                                                    }
                                                </h3>
                                                <div className="h-px flex-1 bg-linear-to-r from-white/20 to-transparent" />
                                                <div className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/60">
                                                    {
                                                        quarterlyByQuarter[
                                                            quarterKey
                                                        ].length
                                                    }{" "}
                                                    goals
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                {quarterlyByQuarter[quarterKey]
                                                    .sort((a, b) => {
                                                        if (
                                                            a.isCompleted !==
                                                            b.isCompleted
                                                        ) {
                                                            return a.isCompleted
                                                                ? 1
                                                                : -1;
                                                        }
                                                        if (
                                                            a.deadline &&
                                                            b.deadline
                                                        ) {
                                                            return (
                                                                new Date(
                                                                    a.deadline
                                                                ).getTime() -
                                                                new Date(
                                                                    b.deadline
                                                                ).getTime()
                                                            );
                                                        }
                                                        return 0;
                                                    })
                                                    .map((goal, index) => (
                                                        <div
                                                            className="fade-in-0 slide-in-from-bottom-4 animate-in"
                                                            key={goal.id}
                                                            style={{
                                                                animationDelay: `${index * 100}ms`,
                                                            }}
                                                        >
                                                            <QuarterlyGoalItem
                                                                goal={goal}
                                                                onEditGoal={() =>
                                                                    handleEditGoal(
                                                                        goal
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {Object.keys(monthlyByYear).length > 0 && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-3xl text-white">
                                Monthly Goals
                            </h2>
                            <div className="text-sm text-white/60">
                                {Object.values(monthlyByYear).flat().length}{" "}
                                goals
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Object.keys(monthlyByYear)
                                .map(Number)
                                .sort((a, b) => a - b)
                                .map((year) => (
                                    <div className="space-y-4" key={year}>
                                        <div className="flex items-center gap-4">
                                            <h3 className="font-bold text-2xl text-white/90">
                                                {year}
                                            </h3>
                                            <div className="h-px flex-1 bg-linear-to-r from-white/20 to-transparent" />
                                            <div className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/60">
                                                {monthlyByYear[year].length}{" "}
                                                goals
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                            {monthlyByYear[year]
                                                .sort((a, b) => {
                                                    if (
                                                        a.isCompleted !==
                                                        b.isCompleted
                                                    ) {
                                                        return a.isCompleted
                                                            ? 1
                                                            : -1;
                                                    }
                                                    if (
                                                        a.deadline &&
                                                        b.deadline
                                                    ) {
                                                        return (
                                                            new Date(
                                                                a.deadline
                                                            ).getTime() -
                                                            new Date(
                                                                b.deadline
                                                            ).getTime()
                                                        );
                                                    }
                                                    return 0;
                                                })
                                                .map((goal, index) => (
                                                    <div
                                                        className="fade-in-0 slide-in-from-bottom-4 animate-in"
                                                        key={goal.id}
                                                        style={{
                                                            animationDelay: `${index * 100}ms`,
                                                        }}
                                                    >
                                                        <QuarterlyGoalItem
                                                            goal={goal}
                                                            onEditGoal={() =>
                                                                handleEditGoal(
                                                                    goal
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="mb-8 flex items-center justify-between">
                <GoalFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onSearchChange={setSearch}
                    search={search}
                />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="space-y-12 lg:col-span-8">{renderGoals()}</div>

                {/* Right column: Stats */}
                <div className="space-y-6 lg:col-span-4">
                    {stats && (
                        <div className="relative">
                            <GoalStats
                                stats={
                                    stats as {
                                        total: number;
                                        completed: number;
                                        overdue: number;
                                        active: number;
                                        completionRate: number;
                                    }
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingGoal && (
                <EditGoalModal
                    goal={editingGoal}
                    onClose={handleCloseEditModal}
                />
            )}
        </div>
    );
}
