"use client";

import {
    RiArrowDownSLine,
    RiArrowRightSLine,
    RiCheckboxBlankCircleLine,
    RiCheckboxCircleFill,
    RiDeleteBin2Line,
    RiEditLine,
    RiSearchLine,
    RiSparklingLine,
    RiStockLine,
} from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";
import type { Goal } from "@/server/db/schema";
import { CategoryBadge } from "./CategoryBadge";
import { EditGoalModal } from "./EditGoalModal";
import { GoalFilters } from "./GoalFilters";
import { GoalStats } from "./GoalStats";

function GoalRow({
    goal,
    onEdit,
}: {
    goal: Goal;
    onEdit: (goal: Goal) => void;
}): React.JSX.Element {
    const { data: categories } = useQuery(
        orpc.categories.getAll.queryOptions({ input: undefined })
    );

    const { mutateAsync: markCompleted, isPending } = useMutation(
        orpc.goals.markCompleted.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.goals.getPaginated.queryKey({ input: {} }),
                    orpc.goals.getStats.queryKey({ input: {} }),
                    orpc.goals.getAll.queryKey({ input: {} }),
                ],
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
        })
    );

    const isOverdue =
        goal.deadline &&
        new Date(goal.deadline) < new Date() &&
        !goal.isCompleted;

    const handleToggle = () => {
        markCompleted({ id: goal.id, isCompleted: !goal.isCompleted });
    };

    return (
        <div
            className={cn(
                "group relative flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-2 py-1.5 transition-all hover:border-white/10 hover:bg-white/10",
                goal.isCompleted && "opacity-60"
            )}
        >
            <button
                className="shrink-0"
                disabled={isPending}
                onClick={handleToggle}
                type="button"
            >
                {goal.isCompleted ? (
                    <RiCheckboxCircleFill className="size-4 text-green-400" />
                ) : (
                    <RiCheckboxBlankCircleLine className="size-4 text-white/30 transition-colors group-hover:text-white/50" />
                )}
            </button>

            <span
                className={cn(
                    "min-w-0 flex-1 truncate text-sm",
                    goal.isCompleted && "line-through"
                )}
            >
                {goal.title}
            </span>

            {goal.categoryId && categories?.find(c => c.id === goal.categoryId) && (
                <div>
                    <CategoryBadge
                        category={categories.find(c => c.id === goal.categoryId)!}
                        size="sm"
                        className="truncate block w-fit max-w-full"
                    />
                </div>
            )}

            {goal.deadline && (
                <span
                    className={cn(
                        "shrink-0 text-xs text-nowrap",
                        isOverdue ? "font-medium text-red-400" : "text-white/40"
                    )}
                >
                    {new Date(goal.deadline).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                    })}
                </span>
            )}

            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100 bg-black/40 backdrop-blur-md rounded-md p-0.5 border border-white/5">
                <button
                    className="rounded p-1 hover:bg-white/10 text-white/70 hover:text-white"
                    onClick={() => onEdit(goal)}
                    type="button"
                >
                    <RiEditLine className="size-3.5" />
                </button>
                <button
                    className="rounded p-1 hover:bg-red-500/20 text-white/70 hover:text-red-400"
                    onClick={() => deleteGoal({ id: goal.id })}
                    type="button"
                >
                    <RiDeleteBin2Line className="size-3.5" />
                </button>
            </div>
        </div>
    );
}

interface SubSectionProps {
    label: string;
    goals: Goal[];
    defaultOpen?: boolean;
    onEdit: (goal: Goal) => void;
}

function SubSection({ label, goals, defaultOpen = true, onEdit }: SubSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const completed = goals.filter((g) => g.isCompleted).length;
    const total = goals.length;
    const allDone = completed === total && total > 0;

    const sorted = [...goals].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
        }
        if (a.deadline && b.deadline) {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        return 0;
    });

    return (
        <div>
            <button
                className="flex w-full items-center gap-2 py-1.5 text-left"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                {isOpen ? (
                    <RiArrowDownSLine className="size-4 text-white/30" />
                ) : (
                    <RiArrowRightSLine className="size-4 text-white/30" />
                )}
                <span className="text-sm text-white/70">{label}</span>
                <span className="text-white/30 text-xs">
                    {completed}/{total}
                </span>
                {allDone && (
                    <span className="text-green-400 text-xs">✓</span>
                )}
            </button>

            {isOpen && sorted.length > 0 && (
                <div className="ml-2 border-white/10 border-l pl-2">
                    {sorted.map((goal) => (
                        <GoalRow goal={goal} key={goal.id} onEdit={onEdit} />
                    ))}
                </div>
            )}
        </div>
    );
}

interface YearCardProps {
    year: number;
    goals: Goal[];
    defaultOpen?: boolean;
    onEdit: (goal: Goal) => void;
}

function YearCard({ year, goals, defaultOpen = true, onEdit }: YearCardProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
    const currentMonth = new Date().getMonth();

    const completed = goals.filter((g) => g.isCompleted).length;
    const total = goals.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const allDone = completed === total && total > 0;

    const { annual, quarters, months } = useMemo(() => {
        const annual: Goal[] = [];
        const quarters: Record<number, Goal[]> = { 1: [], 2: [], 3: [], 4: [] };
        const months: Record<number, Goal[]> = {};

        for (const goal of goals) {
            if (goal.type === "annual") {
                annual.push(goal);
            } else if (goal.type === "quarterly") {
                const date = goal.deadline ? new Date(goal.deadline) : new Date();
                const q = Math.floor(date.getMonth() / 3) + 1;
                quarters[q].push(goal);
            } else if (goal.type === "monthly") {
                const date = goal.deadline ? new Date(goal.deadline) : new Date();
                const m = date.getMonth();
                if (!months[m]) {
                    months[m] = [];
                }
                months[m].push(goal);
            }
        }

        return { annual, quarters, months };
    }, [goals]);

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const isCurrentOrFuture = year >= currentYear;
    const isPast = year < currentYear;

    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border transition-all",
                isPast && allDone
                    ? "border-white/5 bg-white/1"
                    : "border-white/10 bg-white/2"
            )}
        >
            {/* Year Header */}
            <button
                className="flex w-full items-center gap-4 p-4"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                {isOpen ? (
                    <RiArrowDownSLine className="size-5 text-white/40" />
                ) : (
                    <RiArrowRightSLine className="size-5 text-white/40" />
                )}

                <span className="font-semibold text-lg">{year}</span>

                <div className="flex flex-1 items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all",
                                allDone ? "bg-green-400" : "bg-white/30"
                            )}
                            style={{ width: `${percent}% ` }}
                        />
                    </div>
                    <span className="text-sm text-white/50">
                        {completed}/{total}
                    </span>
                </div>

                {allDone && (
                    <span className="rounded-full bg-green-400/10 px-2 py-0.5 text-green-400 text-xs">
                        Complete
                    </span>
                )}
            </button>

            {/* Year Content */}
            {isOpen && (
                <div className="space-y-4 border-white/5 border-t p-4">
                    {/* Annual Goals */}
                    {annual.length > 0 && (
                        <SubSection
                            defaultOpen={isCurrentOrFuture}
                            goals={annual}
                            label="Annual Goals"
                            onEdit={onEdit}
                        />
                    )}

                    {/* Quarterly Goals */}
                    {Object.entries(quarters).some(([, q]) => q.length > 0) && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-white/40 text-xs uppercase tracking-wider">
                                    Quarters
                                </span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                                {[1, 2, 3, 4].map((q) => {
                                    const qGoals = quarters[q];
                                    if (qGoals.length === 0) {
                                        return null;
                                    }
                                    const isCurrent = year === currentYear && q === currentQuarter;
                                    const isFuture = year > currentYear || (year === currentYear && q > currentQuarter);

                                    return (
                                        <SubSection
                                            defaultOpen={isCurrent || isFuture}
                                            goals={qGoals}
                                            key={q}
                                            label={`Q${q} `}
                                            onEdit={onEdit}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Monthly Goals */}
                    {Object.keys(months).length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-white/40 text-xs uppercase tracking-wider">
                                    Months
                                </span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <div className="grid grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(months)
                                    .sort(([a], [b]) => Number(a) - Number(b))
                                    .map(([monthIdx, mGoals]) => {
                                        const m = Number(monthIdx);
                                        const isCurrent = year === currentYear && m === currentMonth;
                                        const isFuture = year > currentYear || (year === currentYear && m > currentMonth);

                                        return (
                                            <SubSection
                                                defaultOpen={isCurrent || isFuture}
                                                goals={mGoals}
                                                key={m}
                                                label={monthNames[m]}
                                                onEdit={onEdit}
                                            />
                                        );
                                    })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function GoalsDashboard() {
    const [search, setSearch] = useState("");
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [filters, setFilters] = useState({
        status: "all" as "all" | "active" | "completed" | "overdue",
        type: "all" as "all" | "annual" | "quarterly" | "monthly",
        hasReminders: null as boolean | null,
        categoryIds: [] as string[],
    });

    const { data, isLoading, error } = useQuery(
        orpc.goals.getPaginated.queryOptions({
            input: {
                page: 0,
                limit: 100,
                sortBy: "sortOrder",
                sortOrder: "asc",
                search: search || undefined,
                status: filters.status !== "all" ? filters.status : undefined,
                type: filters.type !== "all" ? filters.type : undefined,
                categoryIds: filters.categoryIds.length > 0 ? filters.categoryIds : undefined,
            },
        })
    );

    const { data: stats } = useQuery(
        orpc.goals.getStats.queryOptions({ input: { period: "year" } })
    );

    // Group all goals by year
    const goalsByYear = useMemo(() => {
        const goals = data?.goals || [];
        const currentYear = new Date().getFullYear();
        const grouped: Record<number, Goal[]> = {};

        for (const goal of goals) {
            const year = goal.deadline
                ? new Date(goal.deadline).getFullYear()
                : currentYear;
            if (!grouped[year]) {
                grouped[year] = [];
            }
            grouped[year].push(goal);
        }

        return grouped;
    }, [data]);

    const years = Object.keys(goalsByYear)
        .map(Number)
        .sort((a, b) => b - a); // Most recent first

    const currentYear = new Date().getFullYear();

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/2 p-12">
                <RiStockLine className="mb-4 size-12 text-white/20" />
                <p className="text-red-400">Error loading goals</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        className="h-20 animate-pulse rounded-xl bg-white/5"
                        key={i}
                    />
                ))}
            </div>
        );
    }

    if (!data?.goals.length) {
        return (
            <div className="space-y-6">
                {/* Filters */}
                <GoalFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onSearchChange={setSearch}
                    search={search}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Empty State */}
                    <div className="space-y-4 lg:col-span-8">
                        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/2 p-12 text-center">
                            <RiSearchLine className="mb-4 size-12 text-white/20" />
                            <h3 className="mb-2 font-semibold text-xl">No goals found</h3>
                            <p className="mb-6 text-white/60">
                                {search || filters.status !== "all" || filters.type !== "all" || filters.categoryIds.length > 0
                                    ? "Try adjusting your filters or search query"
                                    : "Create your first goal to get started"}
                            </p>
                        </div>
                    </div>

                    {/* Stats Sidebar */}
                    {stats && (
                        <div className="lg:col-span-4">
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
        );
    }

    return (
        <div className="space-y-6">
            <GoalFilters
                filters={filters}
                onFiltersChange={setFilters}
                onSearchChange={setSearch}
                search={search}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-8">
                    {years.map((year) => (
                        <YearCard
                            defaultOpen={year >= currentYear}
                            goals={goalsByYear[year]}
                            key={year}
                            onEdit={setEditingGoal}
                            year={year}
                        />
                    ))}
                </div>

                <div className="lg:col-span-4">
                    {stats && (
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
                    )}
                </div>
            </div>

            {editingGoal && (
                <EditGoalModal
                    goal={editingGoal}
                    onClose={() => setEditingGoal(null)}
                />
            )}
        </div>
    );
}
