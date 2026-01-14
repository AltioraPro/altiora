"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { FormTextarea } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Field,
    FieldContent,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";
import { updateHabitSchema } from "@/server/routers/habits/validators";
import { useHabits } from "./habits-provider";

const HABIT_EMOJIS = [
    "🎯",
    "💪",
    "📚",
    "🏃",
    "🧘",
    "💧",
    "🌱",
    "⚡",
    "🔥",
    "⭐",
    "🌅",
    "🛏️",
    "🥗",
    "🏋️",
    "📝",
    "🎨",
    "🎵",
    "💻",
    "📱",
    "🧠",
    "☀️",
    "🌙",
    "❤️",
    "🦷",
    "👥",
    "🚀",
    "🎪",
    "🏆",
    "💎",
    "🌈",
];

const HABIT_COLORS = [
    "#ffffff",
    "#f3f4f6",
    "#e5e7eb",
    "#d1d5db",
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
];

type UpdateHabitForm = z.infer<typeof updateHabitSchema>;

// Helper function to calculate completion percentage
const calculateCompletionPercentage = (
    totalHabits: number,
    completedHabits: number
): number =>
    totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

// Helper function to update today stats when deactivating a habit
const updateStatsForDeactivation = (
    updatedTodayStats: {
        habits: Array<{ id: string; isCompleted: boolean }>;
        totalHabits: number;
        completedHabits: number;
        completionPercentage: number;
    },
    habitId: string
) => {
    const filteredHabits = updatedTodayStats.habits.filter(
        (h) => h.id !== habitId
    );
    const completedHabits = filteredHabits.filter((h) => h.isCompleted).length;

    return {
        ...updatedTodayStats,
        habits: filteredHabits,
        totalHabits: filteredHabits.length,
        completedHabits,
        completionPercentage: calculateCompletionPercentage(
            filteredHabits.length,
            completedHabits
        ),
    };
};

// Helper function to update today stats when activating a habit
const updateStatsForActivation = (
    updatedTodayStats: {
        habits: Array<{
            id: string;
            title: string;
            emoji: string;
            isCompleted: boolean;
            notes?: string | undefined;
        }>;
        totalHabits: number;
        completedHabits: number;
        completionPercentage: number;
    },
    newHabit: {
        id: string;
        title: string;
        emoji: string;
        isCompleted: boolean;
        notes?: string | undefined;
    }
) => {
    const updatedHabits = [...updatedTodayStats.habits, newHabit];
    const completedHabits = updatedHabits.filter((h) => h.isCompleted).length;

    return {
        ...updatedTodayStats,
        habits: updatedHabits,
        totalHabits: updatedHabits.length,
        completedHabits,
        completionPercentage: calculateCompletionPercentage(
            updatedHabits.length,
            completedHabits
        ),
    };
};

export function EditHabitModal() {
    const { isEditModalOpen, editingHabit, closeEditModal, openEditModal } =
        useHabits();
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const { data: habits } = useQuery(
        orpc.habits.getAll.queryOptions({
            input: {},
            enabled: isEditModalOpen && !!editingHabit,
        })
    );

    const { control, handleSubmit, watch, reset, formState } =
        useForm<UpdateHabitForm>({
            resolver: zodResolver(updateHabitSchema),
            defaultValues: {
                id: "",
                title: "",
                emoji: "🎯",
                description: "",
                color: "#ffffff",
                targetFrequency: "daily",
                isActive: true,
            },
        });

    const emoji = watch("emoji");
    const color = watch("color");
    const title = watch("title");
    const description = watch("description");
    const targetFrequency = watch("targetFrequency");
    const isActive = watch("isActive");

    const { mutateAsync: updateHabit, isPending: isUpdatingHabit } =
        useMutation(
            orpc.habits.update.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.habits.getAll.queryKey({ input: {} }),
                    ],
                },
                onMutate: async (updatedHabit) => {
                    await queryClient.cancelQueries({
                        queryKey: orpc.habits.getDashboard.queryKey(),
                    });
                    const previousData = queryClient.getQueryData(
                        orpc.habits.getDashboard.queryKey()
                    );

                    closeEditModal();

                    if (!previousData) {
                        return { previousData };
                    }

                    // Update habits list
                    const updatedHabits = previousData.habits.map((habit) =>
                        habit.id === updatedHabit.id
                            ? {
                                  ...habit,
                                  ...updatedHabit,
                                  updatedAt: new Date(),
                              }
                            : habit
                    );

                    // Update today stats habits
                    const updatedTodayStats = {
                        ...previousData.todayStats,
                        habits: previousData.todayStats.habits.map((habit) =>
                            habit.id === updatedHabit.id
                                ? {
                                      ...habit,
                                      title: updatedHabit.title || habit.title,
                                      emoji: updatedHabit.emoji || habit.emoji,
                                  }
                                : habit
                        ),
                    };

                    // Handle active/inactive state changes
                    const oldHabit = previousData.habits.find(
                        (h) => h.id === updatedHabit.id
                    );
                    let totalActiveHabits =
                        previousData.stats.totalActiveHabits;

                    if (oldHabit && updatedHabit.isActive !== undefined) {
                        if (oldHabit.isActive && !updatedHabit.isActive) {
                            totalActiveHabits -= 1;
                            Object.assign(
                                updatedTodayStats,
                                updateStatsForDeactivation(
                                    updatedTodayStats,
                                    updatedHabit.id
                                )
                            );
                        } else if (
                            !oldHabit.isActive &&
                            updatedHabit.isActive
                        ) {
                            totalActiveHabits += 1;
                            const newTodayHabit = {
                                id: updatedHabit.id,
                                title: updatedHabit.title || oldHabit.title,
                                emoji: updatedHabit.emoji || oldHabit.emoji,
                                isCompleted: false,
                                notes: undefined,
                            };
                            Object.assign(
                                updatedTodayStats,
                                updateStatsForActivation(
                                    updatedTodayStats,
                                    newTodayHabit
                                )
                            );
                        }
                    }

                    // Update recent activity and weekly stats
                    const today = new Date().toISOString().split("T")[0];
                    const updatedRecentActivity =
                        previousData.recentActivity.map((activity) =>
                            activity.date === today
                                ? {
                                      ...activity,
                                      completionPercentage:
                                          updatedTodayStats.completionPercentage,
                                  }
                                : activity
                        );

                    const updatedWeeklyStats =
                        previousData.stats.weeklyStats.map((stat) =>
                            stat.date === today
                                ? { ...stat, ...updatedTodayStats }
                                : stat
                        );

                    queryClient.setQueryData(
                        orpc.habits.getDashboard.queryKey(),
                        {
                            ...previousData,
                            habits: updatedHabits,
                            todayStats: updatedTodayStats,
                            recentActivity: updatedRecentActivity,
                            stats: {
                                ...previousData.stats,
                                totalActiveHabits,
                                weeklyStats: updatedWeeklyStats,
                            },
                        }
                    );

                    return { previousData };
                },
                onSuccess: () => {
                    addToast({
                        type: "success",
                        title: "Habits updated",
                        message: "Your habit has been updated successfully",
                    });
                },
                onError: (error, variables, context) => {
                    if (context?.previousData) {
                        queryClient.setQueryData(
                            orpc.habits.getDashboard.queryKey(),
                            context.previousData
                        );
                    }

                    if (variables.id) {
                        openEditModal(variables.id);
                    }

                    console.error("Error updating habit:", error);
                    addToast({
                        type: "error",
                        title: "Error",
                        message: error.message || "Unable to update the habit",
                    });
                },
            })
        );

    useEffect(() => {
        if (isEditModalOpen && editingHabit && habits) {
            const habit = habits.find((h) => h.id === editingHabit);
            if (habit) {
                reset({
                    id: habit.id,
                    title: habit.title,
                    emoji: habit.emoji,
                    description: habit.description || "",
                    color: habit.color || "#ffffff",
                    targetFrequency: habit.targetFrequency as
                        | "daily"
                        | "weekly"
                        | "monthly",
                    isActive: habit.isActive,
                });
            }
        } else {
            reset({
                id: "",
                title: "",
                emoji: "🎯",
                description: "",
                color: "#ffffff",
                targetFrequency: "daily",
                isActive: true,
            });
        }
    }, [isEditModalOpen, editingHabit, habits, reset]);

    const handleClose = () => {
        reset({
            id: "",
            title: "",
            emoji: "🎯",
            description: "",
            color: "#ffffff",
            targetFrequency: "daily",
            isActive: true,
        });
        closeEditModal();
    };

    const onSubmit = async (data: UpdateHabitForm) => {
        if (!editingHabit) {
            return;
        }

        await updateHabit({
            id: editingHabit,
            title: data.title?.trim(),
            emoji: data.emoji,
            description: data.description?.trim() || undefined,
            color: data.color || undefined,
            targetFrequency: data.targetFrequency,
            isActive: data.isActive,
        });
    };

    return (
        <Dialog
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                }
            }}
            open={isEditModalOpen}
        >
            <DialogContent overlay={true}>
                <DialogHeader>
                    <DialogTitle>Edit habit</DialogTitle>
                    <DialogDescription>
                        Update your habit details and settings.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    id="edit-habit-form"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {/* Status Toggle */}
                    <Controller
                        control={control}
                        name="isActive"
                        render={({ field }) => (
                            <div className="flex items-center justify-between border border-neutral-800 bg-neutral-900 p-3">
                                <div>
                                    <h4 className="text-sm text-white">
                                        Habit status
                                    </h4>
                                    <p className="text-white/60 text-xs">
                                        {field.value
                                            ? "Active habit"
                                            : "Inactive habit"}
                                    </p>
                                </div>
                                <button
                                    className={cn(
                                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300",
                                        field.value
                                            ? "bg-green-500"
                                            : "bg-white/20"
                                    )}
                                    onClick={() => field.onChange(!field.value)}
                                    type="button"
                                >
                                    <span
                                        className={cn(
                                            "inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300",
                                            field.value
                                                ? "translate-x-5"
                                                : "translate-x-1"
                                        )}
                                    />
                                </button>
                            </div>
                        )}
                    />

                    {/* Emoji Selection */}
                    <Controller
                        control={control}
                        name="emoji"
                        render={({ field }) => (
                            <div>
                                <label
                                    className="mb-2 block text-white/80 text-xs"
                                    htmlFor="emoji"
                                >
                                    EMOJI
                                </label>
                                <div className="grid grid-cols-10 gap-1 border border-input bg-neutral-900 p-3">
                                    {HABIT_EMOJIS.map((emojiOption) => (
                                        <button
                                            className={cn(
                                                "flex h-6 w-6 items-center justify-center",
                                                field.value === emojiOption
                                                    ? "border-2 border-white/40 bg-white/20"
                                                    : "border-2 border-transparent hover:bg-white/10"
                                            )}
                                            key={emojiOption}
                                            onClick={() =>
                                                field.onChange(emojiOption)
                                            }
                                            type="button"
                                        >
                                            {emojiOption}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    />

                    {/* Title */}
                    <Controller
                        control={control}
                        name="title"
                        render={({ field, fieldState }) => {
                            const uniqueId = `title-${editingHabit || ""}`;
                            return (
                                <Field data-invalid={!!fieldState.error}>
                                    <FieldLabel htmlFor={uniqueId}>
                                        TITLE
                                    </FieldLabel>
                                    <FieldContent>
                                        <InputGroup>
                                            <InputGroupAddon align="inline-start">
                                                <InputGroupText className="text-xl">
                                                    {emoji}
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                className={cn(
                                                    fieldState.error &&
                                                        "border-destructive focus-visible:ring-destructive"
                                                )}
                                                id={uniqueId}
                                                placeholder="Ex: Wake up 5:30am, Meditation..."
                                                type="text"
                                                {...field}
                                            />
                                        </InputGroup>
                                        {fieldState.error && (
                                            <FieldError>
                                                {fieldState.error.message}
                                            </FieldError>
                                        )}
                                    </FieldContent>
                                </Field>
                            );
                        }}
                    />

                    {/* Description */}
                    <FormTextarea
                        className="resize-none"
                        control={control}
                        label="DESCRIPTION (OPTIONAL)"
                        name="description"
                        placeholder="Why is this habit important to you..."
                        rows={2}
                    />

                    {/* Color Selection */}
                    <Controller
                        control={control}
                        name="color"
                        render={({ field }) => (
                            <div>
                                <label
                                    className="mb-2 block text-white/80 text-xs"
                                    htmlFor="color"
                                >
                                    ACCENT COLOR
                                </label>
                                <div className="grid grid-cols-10 gap-1 border border-input bg-neutral-900 p-3">
                                    {HABIT_COLORS.map((colorOption) => (
                                        <button
                                            className={cn(
                                                "size-5 rounded border-2",
                                                field.value === colorOption
                                                    ? "scale-110 border-white/60"
                                                    : "border-white/20 hover:border-white/40"
                                            )}
                                            key={colorOption}
                                            onClick={() =>
                                                field.onChange(colorOption)
                                            }
                                            style={{
                                                backgroundColor: colorOption,
                                            }}
                                            type="button"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    />

                    <Separator />

                    {/* Preview */}
                    <div className="border border-input bg-neutral-900 p-3">
                        <div className="flex items-center space-x-2">
                            <div className="text-lg">{emoji}</div>
                            <div className="flex-1">
                                <h4 className="font-medium text-sm text-white">
                                    {title || "Habit title"}
                                </h4>
                                {description && (
                                    <p className="mt-1 text-white/60 text-xs">
                                        {description}
                                    </p>
                                )}
                                <div className="mt-1 flex items-center space-x-2">
                                    <span className="text-white/40 text-xs">
                                        {targetFrequency === "daily" && "DAILY"}
                                        {targetFrequency === "weekly" &&
                                            "WEEKLY"}
                                        {targetFrequency === "monthly" &&
                                            "MONTHLY"}
                                    </span>
                                    {!isActive && (
                                        <span className="text-red-400/80 text-xs">
                                            INACTIVE
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                        </div>
                    </div>
                </form>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            className="flex-1"
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        className="flex-1"
                        disabled={!formState.isValid || isUpdatingHabit}
                        form="edit-habit-form"
                        type="submit"
                    >
                        {isUpdatingHabit ? "Updating..." : "Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
