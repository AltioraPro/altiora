"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { api } from "@/trpc/client";
import { useHabits } from "./HabitsProvider";

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

export function EditHabitModal() {
    const { isEditModalOpen, editingHabit, closeEditModal, openEditModal } =
        useHabits();
    const { addToast } = useToast();
    const [title, setTitle] = useState("");
    const [emoji, setEmoji] = useState("🎯");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#ffffff");
    const [targetFrequency, setTargetFrequency] = useState<
        "daily" | "weekly" | "monthly"
    >("daily");
    const [isActive, setIsActive] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    const utils = api.useUtils();

    const { data: habits } = api.habits.getAll.useQuery(undefined, {
        enabled: isEditModalOpen && !!editingHabit,
    });

    const updateHabit = api.habits.update.useMutation({
        onMutate: async (updatedHabit) => {
            await utils.habits.getDashboard.cancel();
            await utils.habits.getPaginated.cancel();
            const previousData = utils.habits.getDashboard.getData();

            closeEditModal();

            if (previousData) {
                const updatedHabits = previousData.habits.map((habit) =>
                    habit.id === updatedHabit.id
                        ? { ...habit, ...updatedHabit, updatedAt: new Date() }
                        : habit
                );

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

                const oldHabit = previousData.habits.find(
                    (h) => h.id === updatedHabit.id
                );
                let totalActiveHabits = previousData.stats.totalActiveHabits;

                if (oldHabit && updatedHabit.isActive !== undefined) {
                    if (oldHabit.isActive && !updatedHabit.isActive) {
                        totalActiveHabits -= 1;

                        const updatedTodayStatsForDeactivation = {
                            ...updatedTodayStats,
                            habits: updatedTodayStats.habits.filter(
                                (h) => h.id !== updatedHabit.id
                            ),
                        };

                        updatedTodayStatsForDeactivation.totalHabits =
                            updatedTodayStatsForDeactivation.habits.length;
                        const completedHabits =
                            updatedTodayStatsForDeactivation.habits.filter(
                                (h) => h.isCompleted
                            ).length;
                        updatedTodayStatsForDeactivation.completedHabits =
                            completedHabits;
                        updatedTodayStatsForDeactivation.completionPercentage =
                            updatedTodayStatsForDeactivation.totalHabits > 0
                                ? Math.round(
                                      (completedHabits /
                                          updatedTodayStatsForDeactivation.totalHabits) *
                                          100
                                  )
                                : 0;

                        Object.assign(
                            updatedTodayStats,
                            updatedTodayStatsForDeactivation
                        );
                    } else if (!oldHabit.isActive && updatedHabit.isActive) {
                        totalActiveHabits += 1;

                        const newTodayHabit = {
                            id: updatedHabit.id,
                            title: updatedHabit.title || oldHabit.title,
                            emoji: updatedHabit.emoji || oldHabit.emoji,
                            isCompleted: false,
                            notes: undefined,
                        };

                        updatedTodayStats.habits.push(newTodayHabit);
                        updatedTodayStats.totalHabits =
                            updatedTodayStats.habits.length;
                        const completedHabits = updatedTodayStats.habits.filter(
                            (h) => h.isCompleted
                        ).length;
                        updatedTodayStats.completedHabits = completedHabits;
                        updatedTodayStats.completionPercentage =
                            updatedTodayStats.totalHabits > 0
                                ? Math.round(
                                      (completedHabits /
                                          updatedTodayStats.totalHabits) *
                                          100
                                  )
                                : 0;
                    }
                }

                const today = new Date().toISOString().split("T")[0]!;
                const updatedRecentActivity = previousData.recentActivity.map(
                    (activity) =>
                        activity.date === today
                            ? {
                                  ...activity,
                                  completionPercentage:
                                      updatedTodayStats.completionPercentage,
                              }
                            : activity
                );

                const updatedWeeklyStats = previousData.stats.weeklyStats.map(
                    (stat) =>
                        stat.date === today
                            ? { ...stat, ...updatedTodayStats }
                            : stat
                );

                utils.habits.getDashboard.setData(undefined, {
                    ...previousData,
                    habits: updatedHabits,
                    todayStats: updatedTodayStats,
                    recentActivity: updatedRecentActivity,
                    stats: {
                        ...previousData.stats,
                        totalActiveHabits,
                        weeklyStats: updatedWeeklyStats,
                    },
                });
            }

            return { previousData };
        },
        onSuccess: () => {
            addToast({
                type: "success",
                title: "Habitude mise à jour",
                message: "Votre habitude a été modifiée avec succès",
            });
        },
        onError: (error, variables, context) => {
            if (context?.previousData) {
                utils.habits.getDashboard.setData(
                    undefined,
                    context.previousData
                );
            }

            if (variables.id) {
                openEditModal(variables.id);
            }

            console.error("Error updating habit:", error);
            addToast({
                type: "error",
                title: "Erreur",
                message:
                    error.message || "Impossible de mettre à jour l'habitude",
            });
        },
        onSettled: () => {
            utils.habits.getDashboard.invalidate();
            utils.habits.getPaginated.invalidate();
        },
    });

    useEffect(() => {
        if (isEditModalOpen && editingHabit && habits) {
            const habit = habits.find((h) => h.id === editingHabit);
            if (habit) {
                setTitle(habit.title);
                setEmoji(habit.emoji);
                setDescription(habit.description || "");
                setColor(habit.color || "#ffffff");
                setTargetFrequency(
                    habit.targetFrequency as "daily" | "weekly" | "monthly"
                );
                setIsActive(habit.isActive);
                setIsLoaded(true);
            }
        } else {
            setIsLoaded(false);
        }
    }, [isEditModalOpen, editingHabit, habits]);

    const resetForm = useCallback(() => {
        setTitle("");
        setEmoji("🎯");
        setDescription("");
        setColor("#ffffff");
        setTargetFrequency("daily");
        setIsActive(true);
        setIsLoaded(false);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!(title.trim() && editingHabit)) {
            return;
        }

        updateHabit.mutate({
            id: editingHabit,
            title: title.trim(),
            emoji,
            description: description.trim() || undefined,
            color,
            targetFrequency,
            isActive,
        });
    };

    const handleClose = useCallback(() => {
        closeEditModal();
        resetForm();
    }, [closeEditModal, resetForm]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isEditModalOpen) {
                handleClose();
            }
        };

        if (isEditModalOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isEditModalOpen, handleClose]);

    if (!(isEditModalOpen && isLoaded)) {
        return null;
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <div className="pointer-events-auto relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-pure-black">
                    {/* Gradient accent */}
                    <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="max-h-[calc(90vh-2rem)] overflow-y-auto p-4">
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-bold text-lg tracking-tight">
                                EDIT HABIT
                            </h2>
                            <button
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/5 transition-all duration-300 hover:border-white/40 hover:bg-white/10"
                                onClick={handleClose}
                                type="button"
                            >
                                <X className="h-3 w-3 text-white/60" />
                            </button>
                        </div>

                        {/* Form */}
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Status Toggle */}
                            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                                <div>
                                    <h4 className="text-sm text-white">
                                        Habit status
                                    </h4>
                                    <p className="text-white/60 text-xs">
                                        {isActive
                                            ? "Active habit"
                                            : "Inactive habit"}
                                    </p>
                                </div>
                                <button
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
                                        isActive
                                            ? "bg-green-500"
                                            : "bg-white/20"
                                    }`}
                                    onClick={() => setIsActive(!isActive)}
                                    type="button"
                                >
                                    <span
                                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 ${
                                            isActive
                                                ? "translate-x-5"
                                                : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Emoji Selection */}
                            <div>
                                <label
                                    className="mb-2 block text-white/80 text-xs"
                                    htmlFor="emoji"
                                >
                                    EMOJI
                                </label>
                                <div className="grid grid-cols-10 gap-1 rounded-lg border border-white/10 bg-white/5 p-3">
                                    {HABIT_EMOJIS.map((emojiOption) => (
                                        <button
                                            className={`flex h-6 w-6 items-center justify-center rounded text-lg transition-all duration-200 ${
                                                emoji === emojiOption
                                                    ? "border-2 border-white/40 bg-white/20"
                                                    : "border-2 border-transparent hover:bg-white/10"
                                            }`}
                                            key={emojiOption}
                                            onClick={() =>
                                                setEmoji(emojiOption)
                                            }
                                            type="button"
                                        >
                                            {emojiOption}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label
                                    className="mb-2 block text-white/80 text-xs"
                                    htmlFor="title"
                                >
                                    TITLE
                                </label>
                                <div className="relative">
                                    <div className="-translate-y-1/2 absolute top-1/2 left-3 transform text-xl">
                                        {emoji}
                                    </div>
                                    <input
                                        className="w-full rounded-lg border border-white/20 bg-white/5 py-2 pr-3 pl-10 text-white placeholder-white/50 transition-all duration-300 focus:border-white/40 focus:bg-white/10 focus:outline-none"
                                        maxLength={255}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        placeholder="Ex: Wake up 5:30am, Meditation..."
                                        required
                                        type="text"
                                        value={title}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    className="mb-2 block text-white/80 text-xs"
                                    htmlFor="description"
                                >
                                    DESCRIPTION (OPTIONAL)
                                </label>
                                <textarea
                                    className="w-full resize-none rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/50 transition-all duration-300 focus:border-white/40 focus:bg-white/10 focus:outline-none"
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Why is this habit important to you..."
                                    rows={2}
                                    value={description}
                                />
                            </div>

                            {/* Color Selection */}
                            <div>
                                <label
                                    className="mb-2 block text-white/80 text-xs"
                                    htmlFor="color"
                                >
                                    ACCENT COLOR
                                </label>
                                <div className="grid grid-cols-10 gap-1 rounded-lg border border-white/10 bg-white/5 p-3">
                                    {HABIT_COLORS.map((colorOption) => (
                                        <button
                                            className={`h-5 w-5 rounded border-2 transition-all duration-200 ${
                                                color === colorOption
                                                    ? "scale-110 border-white/60"
                                                    : "border-white/20 hover:border-white/40"
                                            }`}
                                            key={colorOption}
                                            onClick={() =>
                                                setColor(colorOption)
                                            }
                                            style={{
                                                backgroundColor: colorOption,
                                            }}
                                            type="button"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
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
                                                {targetFrequency === "daily"
                                                    ? "DAILY"
                                                    : targetFrequency ===
                                                        "weekly"
                                                      ? "WEEKLY"
                                                      : "MONTHLY"}
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

                            {/* Buttons */}
                            <div className="flex items-center space-x-3 pt-3">
                                <button
                                    className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 transition-all duration-300 hover:bg-white/5 hover:text-white"
                                    onClick={handleClose}
                                    type="button"
                                >
                                    CANCEL
                                </button>
                                <button
                                    className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all duration-300 hover:border-white/40 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={
                                        !title.trim() || updateHabit.isPending
                                    }
                                    type="submit"
                                >
                                    {updateHabit.isPending
                                        ? "UPDATING..."
                                        : "UPDATE"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
