"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { FormInput, FormTextarea } from "@/components/form";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";
import { createHabitSchema } from "@/server/routers/habits/validators";
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

type CreateHabitForm = z.infer<typeof createHabitSchema>;

interface CreateHabitModalProps {
    onSuccess?: () => void;
}

export function CreateHabitModal({ onSuccess }: CreateHabitModalProps = {}) {
    const { isCreateModalOpen, closeCreateModal } = useHabits();
    const { addToast } = useToast();

    const { control, handleSubmit, watch, reset, formState } =
        useForm<CreateHabitForm>({
            resolver: zodResolver(createHabitSchema),
            defaultValues: {
                title: "",
                emoji: "🎯",
                description: "",
                color: "#ffffff",
                targetFrequency: "daily",
            },
        });

    const emoji = watch("emoji");
    const color = watch("color");
    const title = watch("title");
    const description = watch("description");

    const { mutateAsync: createHabit, isPending: isCreatingHabit } =
        useMutation(
            orpc.habits.create.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.habits.getAll.queryKey({ input: {} }),
                        orpc.habits.getDashboard.queryKey({ input: {} }),
                        orpc.habits.getPaginated.queryKey({ input: {} }),
                    ],
                },
                onSuccess: () => {
                    addToast({
                        type: "success",
                        title: "Habit created",
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
                        message:
                            error.message || "Impossible to create the habit",
                    });
                },
            })
        );

    const handleClose = () => {
        reset({
            title: "",
            emoji: "🎯",
            description: "",
            color: "#ffffff",
            targetFrequency: "daily",
        });
        closeCreateModal();
    };

    const onSubmit = async (data: CreateHabitForm) => {
        await createHabit({
            title: data.title.trim(),
            emoji: data.emoji,
            description: data.description?.trim() || undefined,
            color: data.color || undefined,
            targetFrequency: data.targetFrequency,
        });
    };

    return (
        <Dialog
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                }
            }}
            open={isCreateModalOpen}
        >
            <DialogContent overlay={true}>
                <DialogHeader>
                    <DialogTitle>Create a new habit</DialogTitle>
                    <DialogDescription>
                        Track your progress and achieve your goals.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    id="create-habit-form"
                    onSubmit={handleSubmit(onSubmit)}
                >
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

                    <FormInput
                        control={control}
                        label="TITLE"
                        name="title"
                        placeholder="Ex: Wake up 5:30am, Meditation..."
                        type="text"
                    />

                    <FormTextarea
                        className="resize-none"
                        control={control}
                        label="DESCRIPTION (OPTIONAL)"
                        name="description"
                        placeholder="Why is this habit important to you..."
                        rows={2}
                    />

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
                        disabled={!formState.isValid || isCreatingHabit}
                        form="create-habit-form"
                        type="submit"
                    >
                        {isCreatingHabit ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
