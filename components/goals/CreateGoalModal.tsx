"use client";

import { AlertCircle, Crown, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useOptimizedGoalMutation } from "@/hooks/useOptimizedGoalMutation";

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateGoalModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateGoalModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "annual" as "annual" | "quarterly" | "monthly",
        deadline: "",
        quarter: "Q1" as "Q1" | "Q2" | "Q3" | "Q4",
        remindersEnabled: false,
        reminderFrequency: "weekly" as "daily" | "weekly" | "monthly",
    });

    // const { data: goalLimits } = api.goals.getAllGoalLimits.useQuery(
    //     undefined,
    //     {
    //         staleTime: 60_000, // 1 minute
    //         refetchOnWindowFocus: false,
    //         refetchOnMount: false,
    //         refetchOnReconnect: false,
    //     }
    // );

    // React.useEffect(() => {
    //     if (goalLimits?.annual.canCreate) {
    //         setFormData((prev) => ({ ...prev, type: "annual" }));
    //     } else if (goalLimits?.quarterly.canCreate) {
    //         setFormData((prev) => ({ ...prev, type: "quarterly" }));
    //     } else if (goalLimits?.monthly.canCreate) {
    //         setFormData((prev) => ({ ...prev, type: "monthly" }));
    //     }
    // }, [
    //     goalLimits?.annual.canCreate,
    //     goalLimits?.quarterly.canCreate,
    //     goalLimits?.monthly.canCreate,
    // ]);

    const { createGoal, isCreating, createError } = useOptimizedGoalMutation();

    const handleCreateGoal = (data: {
        title: string;
        description: string;
        type: "annual" | "quarterly" | "monthly";
        deadline?: Date;
        reminderFrequency?: "daily" | "weekly" | "monthly";
    }) => {
        createGoal(data, {
            onSuccess: () => {
                handleClose();
                onSuccess?.();
            },
        });
    };

    const handleClose = () => {
        setFormData({
            title: "",
            description: "",
            type: "annual",
            deadline: "",
            quarter: "Q1",
            remindersEnabled: false,
            reminderFrequency: "weekly",
        });
        onClose();
    };

    const getQuarterDate = (
        quarter: string,
        year: number = new Date().getFullYear()
    ) => {
        const quarterMap = {
            Q1: new Date(year, 2, 31), // March 31
            Q2: new Date(year, 5, 30), // June 30
            Q3: new Date(year, 8, 30), // September 30
            Q4: new Date(year, 11, 31), // December 31
        };
        return quarterMap[quarter as keyof typeof quarterMap];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            return;
        }

        let deadline: Date | undefined;

        if (formData.type === "quarterly") {
            deadline = getQuarterDate(formData.quarter);
        } else if (formData.deadline) {
            deadline = new Date(formData.deadline);
        }

        handleCreateGoal({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            deadline,
            reminderFrequency: formData.remindersEnabled
                ? formData.reminderFrequency
                : undefined,
        });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-pure-black">
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="max-h-[calc(90vh-2rem)] overflow-y-auto p-4">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-bold text-lg tracking-tight">
                            NEW GOAL
                        </h2>
                        <button
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/5 transition-all duration-300 hover:border-white/40 hover:bg-white/10"
                            onClick={onClose}
                            type="button"
                        >
                            <X className="h-4 w-4 text-white/60" />
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Titre */}
                        <div>
                            <label
                                className="mb-2 block font-medium text-sm text-white"
                                htmlFor="title"
                            >
                                Goal Title *
                            </label>
                            <input
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white/20"
                                id="title"
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
                                htmlFor="description"
                            >
                                Description
                            </label>
                            <textarea
                                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white/20"
                                id="description"
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
                                htmlFor="type"
                            >
                                Goal Type
                            </label>
                            <select
                                className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white/20"
                                id="type"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        type: e.target.value as
                                            | "annual"
                                            | "quarterly"
                                            | "monthly",
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
                                    // disabled={!goalLimits?.annual.canCreate}
                                    value="annual"
                                >
                                    Annual{" "}
                                    {/* {!goalLimits?.annual.canCreate &&
                                        `(${goalLimits?.annual.current}/${goalLimits?.annual.max})`} */}
                                </option>
                                <option
                                    className="bg-neutral-900 text-white"
                                    // disabled={!goalLimits?.quarterly.canCreate}
                                    value="quarterly"
                                >
                                    Quarterly{" "}
                                    {/* {!goalLimits?.quarterly.canCreate &&
                                        `(${goalLimits?.quarterly.current}/${goalLimits?.quarterly.max})`} */}
                                </option>
                                <option
                                    className="bg-neutral-900 text-white"
                                    // disabled={!goalLimits?.monthly.canCreate}
                                    value="monthly"
                                >
                                    Monthly{" "}
                                    {/* {!goalLimits?.monthly.canCreate &&
                                        `(${goalLimits?.monthly.current}/${goalLimits?.monthly.max})`} */}
                                </option>
                            </select>

                            {/* Afficher les restrictions */}
                            {/* {!(
                                goalLimits?.annual.canCreate &&
                                goalLimits?.quarterly.canCreate &&
                                goalLimits?.monthly.canCreate
                            ) && ( */}
                            <div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                                <div className="flex items-start gap-2">
                                    <Crown className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400" />
                                    <div className="text-sm">
                                        <p className="mb-1 font-medium text-yellow-400">
                                            Plan Limitations
                                        </p>
                                        <p className="text-xs text-yellow-300/80">
                                            You&apos;ve reached the limit for
                                            some goal types.
                                            <button
                                                className="mr-1 ml-1 text-yellow-400 underline hover:text-yellow-300"
                                                onClick={() =>
                                                    window.open(
                                                        "/pricing",
                                                        "_blank"
                                                    )
                                                }
                                                type="button"
                                            >
                                                Upgrade your plan
                                            </button>
                                            to create unlimited goals.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* )} */}
                        </div>

                        {/* Date limite ou Trimestre */}
                        <div>
                            <label
                                className="mb-2 block font-medium text-sm text-white"
                                htmlFor="deadline"
                            >
                                {formData.type === "quarterly"
                                    ? "Quarter"
                                    : "Deadline"}
                            </label>
                            {formData.type === "quarterly" ? (
                                <select
                                    className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white/20"
                                    id="quarter"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            quarter: e.target.value as
                                                | "Q1"
                                                | "Q2"
                                                | "Q3"
                                                | "Q4",
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
                                    value={formData.quarter}
                                >
                                    <option
                                        className="bg-neutral-900 text-white"
                                        value="Q1"
                                    >
                                        Q1 (Jan - Mar)
                                    </option>
                                    <option
                                        className="bg-neutral-900 text-white"
                                        value="Q2"
                                    >
                                        Q2 (Apr - Jun)
                                    </option>
                                    <option
                                        className="bg-neutral-900 text-white"
                                        value="Q3"
                                    >
                                        Q3 (Jul - Sep)
                                    </option>
                                    <option
                                        className="bg-neutral-900 text-white"
                                        value="Q4"
                                    >
                                        Q4 (Oct - Dec)
                                    </option>
                                </select>
                            ) : (
                                <input
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white/20"
                                    id="deadline"
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
                            )}
                        </div>

                        {/* Rappels */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <input
                                    checked={formData.remindersEnabled}
                                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-white/20"
                                    id="remindersEnabled"
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
                                    htmlFor="remindersEnabled"
                                >
                                    Enable reminders
                                </label>
                            </div>

                            {formData.remindersEnabled && (
                                <div>
                                    <label
                                        className="mb-2 block font-medium text-sm text-white"
                                        htmlFor="reminderFrequency"
                                    >
                                        Reminder Frequency
                                    </label>
                                    <select
                                        className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white/20"
                                        id="reminderFrequency"
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
                            )}
                        </div>

                        {/* Error Message */}
                        {createError && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                                    <div className="text-sm">
                                        <p className="mb-1 font-medium text-red-400">
                                            Error
                                        </p>
                                        <p className="text-red-300/80 text-xs">
                                            {createError.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                disabled={isCreating || !formData.title.trim()}
                                type="submit"
                            >
                                {isCreating ? "CREATING..." : "CREATE"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
