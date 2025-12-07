"use client";

import { RiCheckLine, RiCircleLine } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";
import type { DailyHabitStats } from "@/server/routers/habits/types";
import { useHabits } from "./habits-provider";
import { ProgressCircle } from "./progress-circle";

interface TodayHabitsCardProps {
    data?: DailyHabitStats;
}

interface HabitItemProps {
    habit: {
        id: string;
        title: string;
        emoji: string;
        isCompleted: boolean;
        notes?: string;
    };
    isOptimistic: boolean;
    onToggle: () => void;
}

const HabitItem = memo<HabitItemProps>(({ habit, isOptimistic, onToggle }) => {
    const handleClick = useCallback(() => {
        if (!habit.id.startsWith("temp-")) {
            onToggle();
        }
    }, [habit.id, onToggle]);

    const isTempHabit = habit.id.startsWith("temp-");

    return (
        <div
            className={cn(
                "flex items-center space-x-4 border p-4 transition-all duration-200",
                habit.isCompleted
                    ? "border-green-500/30 bg-green-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                isOptimistic && "opacity-80"
            )}
        >
            {/* Emoji */}
            <div className="relative">
                <div
                    className={cn(
                        "select-none text-2xl transition-all duration-200",
                        habit.isCompleted ? "scale-110" : ""
                    )}
                >
                    {habit.emoji}
                </div>
                {habit.isCompleted && (
                    <div className="-top-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                        <RiCheckLine className="size-3 text-white" />
                    </div>
                )}
            </div>

            {/* Habit Info */}
            <div className="flex-1">
                <h4
                    className={cn(
                        "font-medium transition-all duration-200",
                        habit.isCompleted
                            ? "text-green-300 line-through"
                            : "text-white"
                    )}
                >
                    {habit.title}
                </h4>
                {habit.notes && (
                    <p className="mt-1 text-sm text-white/60">{habit.notes}</p>
                )}
            </div>

            {/* Toggle Button */}
            <button
                className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110 disabled:opacity-50",
                    isTempHabit &&
                        "cursor-not-allowed border-white/20 bg-white/5",
                    habit.isCompleted &&
                        !isTempHabit &&
                        "border-green-500 bg-green-500 text-white",
                    !(isTempHabit || habit.isCompleted) &&
                        "border-white/30 hover:border-white/60"
                )}
                disabled={isTempHabit}
                onClick={handleClick}
                type="button"
            >
                {isTempHabit ? (
                    <div className="h-3 w-3 animate-spin rounded-full border border-white/40 border-t-transparent" />
                ) : (
                    habit.isCompleted && <RiCheckLine className="size-4" />
                )}
            </button>
        </div>
    );
});

HabitItem.displayName = "HabitItem";

export function TodayHabitsCard({ data }: TodayHabitsCardProps) {
    const {
        setOptimisticUpdate,
        clearOptimisticUpdate,
        getOptimisticTodayStats,
        getOptimisticStats,
        getOptimisticRecentActivity,
        optimisticUpdates,
    } = useHabits();
    const { addToast } = useToast();

    const queryClient = useQueryClient();

    const optimisticData = useMemo(
        () => getOptimisticTodayStats(data),
        [data, getOptimisticTodayStats]
    );

    const toggleCompletion = useMutation(
        orpc.habits.toggleCompletion.mutationOptions({
            meta: {
                invalidateQueries: [orpc.habits.getDashboard.queryKey()],
            },
            onMutate: async ({ habitId, isCompleted }) => {
                setOptimisticUpdate(habitId, isCompleted);

                await queryClient.cancelQueries({
                    queryKey: orpc.habits.getDashboard.queryKey(),
                });

                const previousData = queryClient.getQueryData(
                    orpc.habits.getDashboard.queryKey()
                );

                if (previousData) {
                    const optimisticTodayStats = getOptimisticTodayStats(
                        previousData.todayStats
                    );
                    const optimisticStats = getOptimisticStats(
                        previousData.stats,
                        optimisticTodayStats?.habits
                    );
                    const optimisticRecentActivity =
                        getOptimisticRecentActivity(
                            previousData.recentActivity,
                            optimisticTodayStats?.habits
                        );

                    queryClient.setQueryData(
                        orpc.habits.getDashboard.queryKey(),
                        {
                            ...previousData,
                            todayStats:
                                optimisticTodayStats || previousData.todayStats,
                            stats: optimisticStats || previousData.stats,
                            recentActivity:
                                optimisticRecentActivity ||
                                previousData.recentActivity,
                        }
                    );
                }

                return { previousData };
            },
            onError: (error, variables, context) => {
                clearOptimisticUpdate(variables.habitId);

                if (context?.previousData) {
                    queryClient.setQueryData(
                        orpc.habits.getDashboard.queryKey(),
                        context.previousData
                    );
                }

                addToast({
                    type: "error",
                    title: "Erreur",
                    message:
                        error.message ||
                        "Impossible de mettre à jour l'habitude",
                });
            },
        })
    );

    const handleToggleHabit = useCallback(
        (habitId: string, currentStatus: boolean) => {
            if (habitId.startsWith("temp-")) {
                return;
            }

            const today = new Date().toISOString().split("T")[0];

            toggleCompletion.mutate({
                habitId,
                completionDate: today,
                isCompleted: !currentStatus,
            });
        },
        [toggleCompletion]
    );

    const habitsList = useMemo(() => {
        if (!optimisticData?.habits) {
            return [];
        }

        return optimisticData.habits.map((habit) => ({
            ...habit,
            isOptimistic: optimisticUpdates[habit.id] !== undefined,
        }));
    }, [optimisticData?.habits, optimisticUpdates]);

    if (!optimisticData) {
        return <TodayHabitsCardSkeleton />;
    }

    const { completionPercentage, completedHabits, totalHabits } =
        optimisticData;

    return (
        <div className="relative overflow-hidden border border-neutral-800 bg-neutral-900">
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-xl tracking-tight">
                            TODAY&apos;S HABITS
                        </h3>
                        <p className="mt-1 text-sm text-white/60">
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                            })}
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <div className="font-bold text-2xl">
                                <span
                                    className={cn(
                                        "text-white/70",
                                        completionPercentage === 100 &&
                                            "text-green-400",
                                        completionPercentage >= 50 &&
                                            "text-white"
                                    )}
                                >
                                    {completionPercentage}%
                                </span>
                            </div>
                            <div className="text-white/50 text-xs">
                                {completedHabits}/{totalHabits} COMPLETED
                            </div>
                        </div>

                        <div className="relative h-16 w-16">
                            <ProgressCircle
                                completionPercentage={completionPercentage}
                            />

                            <div className="absolute inset-0 flex items-center justify-center">
                                {completionPercentage === 100 ? (
                                    <RiCheckLine className="size-6 text-green-400" />
                                ) : (
                                    <span className="font-bold text-sm">
                                        {Math.round(completionPercentage)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {habitsList.length === 0 ? (
                        <div className="py-8 text-center text-white/50">
                            <RiCircleLine className="mx-auto mb-4 size-12 opacity-30" />
                            <p className="">No habits configured</p>
                            <p className="mt-1 text-sm">
                                Create your first habit to get started
                            </p>
                        </div>
                    ) : (
                        habitsList.map((habit) => (
                            <HabitItem
                                habit={habit}
                                isOptimistic={habit.isOptimistic}
                                key={habit.id}
                                onToggle={() =>
                                    handleToggleHabit(
                                        habit.id,
                                        habit.isCompleted
                                    )
                                }
                            />
                        ))
                    )}
                </div>

                {habitsList.length > 0 && (
                    <div className="mt-6 flex items-center justify-between border-white/10 border-t pt-6 text-sm text-white/60">
                        <span>
                            {(() => {
                                if (completionPercentage === 100) {
                                    return "🎉 Perfect! All habits completed";
                                }
                                if (completedHabits > 0) {
                                    return `✅ ${completedHabits} validated - Your streak continues!`;
                                }
                                return `${totalHabits} habits - Validate at least one to maintain your streak`;
                            })()}
                        </span>

                        {completionPercentage === 100 && (
                            <div className="flex items-center space-x-2 text-green-400">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                <span className="">GOAL ACHIEVED</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function TodayHabitsCardSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="mb-2 h-6 w-48 rounded bg-white/10" />
                    <div className="h-4 w-32 rounded bg-white/5" />
                </div>
                <div className="h-16 w-16 rounded-full bg-white/10" />
            </div>

            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        className="flex items-center space-x-4 rounded-xl bg-white/5 p-4"
                        key={i}
                    >
                        <div className="h-8 w-8 rounded bg-white/10" />
                        <div className="flex-1">
                            <div className="mb-2 h-4 w-32 rounded bg-white/10" />
                            <div className="h-3 w-24 rounded bg-white/5" />
                        </div>
                        <div className="h-8 w-8 rounded-full bg-white/10" />
                    </div>
                ))}
            </div>
        </div>
    );
}
