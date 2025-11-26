"use client";

import { RiCloseCircleLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useState } from "react";
import { orpc } from "@/orpc/client";
import type { Goal } from "@/server/db/schema";

interface EditGoalModalProps {
    goal: Goal;
    onClose: () => void;
    onGoalChange?: () => void;
}

export function EditGoalModal({
    goal,
    onClose,
    onGoalChange,
}: EditGoalModalProps) {
    const [formData, setFormData] = useState({
        title: goal.title,
        description: goal.description || "",
        type: goal.type,
        deadline: goal.deadline
            ? new Date(goal.deadline).toISOString().slice(0, 10)
            : "",
        remindersEnabled: goal.remindersEnabled,
        reminderFrequency: goal.reminderFrequency || "weekly",
    });

    const updateGoalMutation = useMutation(
        orpc.goals.update.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.goals.getPaginated.queryKey({ input: {} }),
                    orpc.goals.getStats.queryKey({ input: {} }),
                    orpc.goals.getAll.queryKey({ input: {} }),
                ],
            },
            onSuccess: () => {
                onGoalChange?.();
                onClose();
            },
        })
    );

    useEffect(() => {
        setFormData({
            title: goal.title,
            description: goal.description || "",
            type: goal.type,
            deadline: goal.deadline
                ? new Date(goal.deadline).toISOString().slice(0, 10)
                : "",
            remindersEnabled: goal.remindersEnabled,
            reminderFrequency: goal.reminderFrequency || "weekly",
        });
    }, [goal]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            return;
        }

        updateGoalMutation.mutate({
            id: goal.id,
            ...formData,
            type: formData.type as "annual" | "quarterly" | "monthly",
            deadline: formData.deadline
                ? new Date(formData.deadline)
                : undefined,
            reminderFrequency: formData.remindersEnabled
                ? (formData.reminderFrequency as "daily" | "weekly" | "monthly")
                : undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl border border-white/20">
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />

                <div className="max-h-[calc(90vh-2rem)] overflow-y-auto p-4">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-bold text-lg tracking-tight">
                            EDIT GOAL
                        </h2>
                        <button
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/5 transition-all duration-300 hover:border-white/40 hover:bg-white/10"
                            onClick={onClose}
                            type="button"
                        >
                            <RiCloseCircleLine className="size-4 text-white/60" />
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Titre */}
                        <div>
                            <label
                                className="mb-2 block font-medium text-sm text-white"
                                htmlFor="edit-title"
                            >
                                Goal Title *
                            </label>
                            <input
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-white/20"
                                id="edit-title"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Ex: Learn React"
                                required
                                type="text"
                                value={formData.title}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                className="mb-2 block font-medium text-sm text-white"
                                htmlFor="edit-description"
                            >
                                Description
                            </label>
                            <textarea
                                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-white/20"
                                id="edit-description"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Describe your goal in detail..."
                                rows={3}
                                value={formData.description}
                            />
                        </div>

                        {/* Type d'objectif */}
                        <div>
                            <label
                                className="mb-2 block font-medium text-sm text-white"
                                htmlFor="edit-type"
                            >
                                Goal Type
                            </label>
                            <select
                                className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-white/20"
                                id="edit-type"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        type: e.target.value as
                                            | "annual"
                                            | "quarterly"
                                            | "custom",
                                    })
                                }
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: "right 0.5rem center",
                                    backgroundRepeat: "no-repeat",
                                    backgroundSize: "1.5em 1.5em",
                                    paddingRight: "2.5rem",
                                }}
                                value={formData.type}
                            >
                                <option
                                    className="bg-neutral-900 text-white"
                                    value="annual"
                                >
                                    Annual
                                </option>
                                <option
                                    className="bg-neutral-900 text-white"
                                    value="quarterly"
                                >
                                    Quarterly
                                </option>
                                <option
                                    className="bg-neutral-900 text-white"
                                    value="monthly"
                                >
                                    Monthly
                                </option>
                            </select>
                        </div>

                        {/* Date limite */}
                        <div>
                            <label
                                className="mb-2 block font-medium text-sm text-white"
                                htmlFor="edit-deadline"
                            >
                                Deadline
                            </label>
                            <input
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-white/20"
                                id="edit-deadline"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        deadline: e.target.value,
                                    })
                                }
                                style={{
                                    colorScheme: "dark",
                                }}
                                type="date"
                                value={formData.deadline}
                            />
                        </div>

                        {/* Rappels */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <input
                                    checked={formData.remindersEnabled}
                                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-white/20"
                                    id="edit-remindersEnabled"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            remindersEnabled: e.target.checked,
                                        })
                                    }
                                    type="checkbox"
                                />
                                <label
                                    className="font-medium text-sm text-white"
                                    htmlFor="edit-remindersEnabled"
                                >
                                    Enable reminders
                                </label>
                            </div>

                            {formData.remindersEnabled && (
                                <>
                                    <div>
                                        <label
                                            className="mb-2 block font-medium text-sm text-white"
                                            htmlFor="edit-reminderFrequency"
                                        >
                                            Reminder Frequency
                                        </label>
                                        <select
                                            className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-white/20"
                                            id="edit-reminderFrequency"
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    reminderFrequency: e.target
                                                        .value as
                                                        | "daily"
                                                        | "weekly"
                                                        | "monthly",
                                                })
                                            }
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                                backgroundPosition:
                                                    "right 0.5rem center",
                                                backgroundRepeat: "no-repeat",
                                                backgroundSize: "1.5em 1.5em",
                                                paddingRight: "2.5rem",
                                            }}
                                            value={formData.reminderFrequency}
                                        >
                                            <option
                                                className="bg-neutral-900 text-white"
                                                value="daily"
                                            >
                                                Daily
                                            </option>
                                            <option
                                                className="bg-neutral-900 text-white"
                                                value="weekly"
                                            >
                                                Weekly
                                            </option>
                                            <option
                                                className="bg-neutral-900 text-white"
                                                value="monthly"
                                            >
                                                Monthly
                                            </option>
                                        </select>
                                    </div>

                                    {/* Next reminder display */}
                                    {goal.nextReminderDate && (
                                        <div className="text-xs text-white/60">
                                            Next reminder:{" "}
                                            <span className="text-white/80">
                                                {new Date(
                                                    goal.nextReminderDate
                                                ).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center space-x-3 pt-3">
                            <button
                                className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 transition-all duration-300 hover:bg-white/5 hover:text-white"
                                onClick={onClose}
                                type="button"
                            >
                                CANCEL
                            </button>
                            <button
                                className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all duration-300 hover:border-white/40 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={
                                    updateGoalMutation.isPending ||
                                    !formData.title.trim()
                                }
                                type="submit"
                            >
                                {updateGoalMutation.isPending
                                    ? "UPDATING..."
                                    : "UPDATE"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
