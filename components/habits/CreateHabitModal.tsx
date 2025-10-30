"use client";

import { X } from "lucide-react";
import { useState } from "react";
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

interface CreateHabitModalProps {
    onSuccess?: () => void;
}

export function CreateHabitModal({ onSuccess }: CreateHabitModalProps = {}) {
    const { isCreateModalOpen, closeCreateModal } = useHabits();
    const { addToast } = useToast();
    const [title, setTitle] = useState("");
    const [emoji, setEmoji] = useState("🎯");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#ffffff");

    const utils = api.useUtils();
    const createHabitMutation = api.habits.create.useMutation({
        onSuccess: () => {
            utils.habits.getAll.invalidate();
            utils.habits.getDashboard.invalidate();
            addToast({
                type: "success",
                title: "Habits created",
                message: "Your new habit has been created successfully",
            });
            handleClose();
            onSuccess?.();
        },
        onError: (error) => {
            console.error("Error creating habit:", error);
            addToast({
                type: "error",
                title: "Error",
                message: error.message || "Impossible to create the habit",
            });
        },
    });

    const handleClose = () => {
        setTitle("");
        setEmoji("🎯");
        setDescription("");
        setColor("#ffffff");
        closeCreateModal();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            return;
        }

        createHabitMutation.mutate({
            title: title.trim(),
            emoji,
            description: description.trim() || undefined,
            color,
        });
    };

    if (!isCreateModalOpen) {
        return null;
    }

    return (
        <>
            <div
                className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            <div className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <div className="pointer-events-auto relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-pure-black">
                    <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="max-h-[calc(90vh-2rem)] overflow-y-auto p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-bold text-lg tracking-tight">
                                NEW HABIT
                            </h2>
                            <button
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/5 transition-all duration-300 hover:border-white/40 hover:bg-white/10"
                                onClick={handleClose}
                                type="button"
                            >
                                <X className="h-3 w-3 text-white/60" />
                            </button>
                        </div>

                        {/* <LimitsBanner /> */}

                        <form className="space-y-4" onSubmit={handleSubmit}>
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
                                    </div>
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                </div>
                            </div>

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
                                        !title.trim() ||
                                        createHabitMutation.isPending
                                    }
                                    type="submit"
                                >
                                    {createHabitMutation.isPending
                                        ? "CREATING..."
                                        : "CREATE"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
