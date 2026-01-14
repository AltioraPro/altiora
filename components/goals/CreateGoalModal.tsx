import { RiAlertLine } from "@remixicon/react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOptimizedGoalMutation } from "@/hooks/useOptimizedGoalMutation";
import { CategorySelector } from "./CategorySelector";

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
        year: new Date().getFullYear().toString(),
        quarter: "Q1" as "Q1" | "Q2" | "Q3" | "Q4",
        categoryId: null as string | null,
        remindersEnabled: false,
        reminderFrequency: "weekly" as "daily" | "weekly" | "monthly",
    });

    const { createGoal, isCreating, createError } = useOptimizedGoalMutation();

    const handleCreateGoal = (data: {
        title: string;
        description: string;
        type: "annual" | "quarterly" | "monthly";
        deadline?: Date;
        remindersEnabled: boolean;
        reminderFrequency?: "daily" | "weekly" | "monthly";
    }): void => {
        createGoal(data, {
            onSuccess: () => {
                handleClose();
                onSuccess?.();
            },
        });
    };

    const handleClose = (): void => {
        setFormData({
            title: "",
            description: "",
            type: "annual",
            deadline: "",
            year: new Date().getFullYear().toString(),
            quarter: "Q1",
            categoryId: null,
            remindersEnabled: false,
            reminderFrequency: "weekly",
        });
        onClose();
    };

    const getQuarterDate = (
        quarter: string,
        year: number = new Date().getFullYear()
    ): Date => {
        const quarterMap = {
            Q1: new Date(year, 2, 31), // March 31
            Q2: new Date(year, 5, 30), // June 30
            Q3: new Date(year, 8, 30), // September 30
            Q4: new Date(year, 11, 31), // December 31
        };
        return quarterMap[quarter as keyof typeof quarterMap];
    };

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!formData.title.trim()) {
            return;
        }

        let deadline: Date | undefined;

        if (formData.type === "annual") {
            // For annual goals, use December 31st of the selected year
            const year = Number.parseInt(formData.year, 10);
            deadline = new Date(year, 11, 31); // December 31st
        } else if (formData.type === "quarterly") {
            const year = Number.parseInt(formData.year, 10);
            deadline = getQuarterDate(formData.quarter, year);
        } else if (formData.deadline) {
            deadline = new Date(formData.deadline);
        }

        handleCreateGoal({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            deadline,
            categoryId: formData.categoryId,
            remindersEnabled: formData.remindersEnabled,
            reminderFrequency: formData.remindersEnabled
                ? formData.reminderFrequency
                : undefined,
        } as any);
    };

    return (
        <Dialog onOpenChange={onClose} open={isOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>New Goal</DialogTitle>
                    <DialogDescription>
                        Create a new goal to track your progress
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Goal Title *</Label>
                        <Input
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
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
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

                    {/* Goal Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">Goal Type</Label>
                        <Select
                            onValueChange={(value) =>
                                setFormData({
                                    ...formData,
                                    type: value as
                                        | "annual"
                                        | "quarterly"
                                        | "monthly",
                                })
                            }
                            value={formData.type}
                        >
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select goal type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="annual">Annual</SelectItem>
                                <SelectItem value="quarterly">
                                    Quarterly
                                </SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Plan Limitations */}
                        {/* TODO : remmettre pour que ce sois fonctionnel */}
                        {/* <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                            <div className="flex items-start gap-2">
                                <RiVipCrownLine className="mt-0.5 size-4 shrink-0 text-yellow-400" />
                                <div className="text-sm">
                                    <p className="mb-1 font-medium text-yellow-400">
                                        Plan Limitations
                                    </p>
                                    <p className="text-xs text-yellow-300/80">
                                        You&apos;ve reached the limit for some
                                        goal types.
                                        <button
                                            className="mr-1 ml-1 text-yellow-400 underline hover:text-yellow-300"
                                            onClick={() =>
                                                window.open("/pricing", "_blank")
                                            }
                                            type="button"
                                        >
                                            Upgrade your plan
                                        </button>
                                        to create unlimited goals.
                                    </p>
                                </div>
                            </div>
                        </div> */}
                    </div>

                    {/* Category Selector */}
                    <CategorySelector
                        onChange={(categoryId) =>
                            setFormData({ ...formData, categoryId })
                        }
                        value={formData.categoryId}
                    />

                    {/* Deadline, Year, or Quarter */}
                    <div className="space-y-2">
                        <Label htmlFor="deadline">
                            {formData.type === "quarterly"
                                ? "Quarter"
                                : formData.type === "annual"
                                  ? "Year"
                                  : "Deadline"}
                        </Label>
                        {formData.type === "annual" ? (
                            <Input
                                id="year"
                                max={new Date().getFullYear() + 10}
                                min={new Date().getFullYear()}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        year: e.target.value,
                                    })
                                }
                                placeholder="2026"
                                type="number"
                                value={formData.year}
                            />
                        ) : formData.type === "quarterly" ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label
                                        className="text-muted-foreground text-xs"
                                        htmlFor="quarter-year"
                                    >
                                        Year
                                    </Label>
                                    <Input
                                        id="quarter-year"
                                        max={new Date().getFullYear() + 10}
                                        min={new Date().getFullYear()}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                year: e.target.value,
                                            })
                                        }
                                        type="number"
                                        value={formData.year}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        className="text-muted-foreground text-xs"
                                        htmlFor="quarter"
                                    >
                                        Quarter
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                quarter: value as
                                                    | "Q1"
                                                    | "Q2"
                                                    | "Q3"
                                                    | "Q4",
                                            })
                                        }
                                        value={formData.quarter}
                                    >
                                        <SelectTrigger id="quarter">
                                            <SelectValue placeholder="Select quarter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Q1">
                                                Q1 (Jan - Mar)
                                            </SelectItem>
                                            <SelectItem value="Q2">
                                                Q2 (Apr - Jun)
                                            </SelectItem>
                                            <SelectItem value="Q3">
                                                Q3 (Jul - Sep)
                                            </SelectItem>
                                            <SelectItem value="Q4">
                                                Q4 (Oct - Dec)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            <Input
                                id="deadline"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        deadline: e.target.value,
                                    })
                                }
                                type="date"
                                value={formData.deadline}
                            />
                        )}
                    </div>

                    {/* Reminders */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={formData.remindersEnabled}
                                id="remindersEnabled"
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        remindersEnabled: checked as boolean,
                                    })
                                }
                            />
                            <Label
                                className="cursor-pointer"
                                htmlFor="remindersEnabled"
                            >
                                Enable reminders
                            </Label>
                        </div>

                        {formData.remindersEnabled && (
                            <div className="space-y-2">
                                <Label htmlFor="reminderFrequency">
                                    Reminder Frequency
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            reminderFrequency: value as
                                                | "daily"
                                                | "weekly"
                                                | "monthly",
                                        })
                                    }
                                    value={formData.reminderFrequency}
                                >
                                    <SelectTrigger id="reminderFrequency">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">
                                            Daily
                                        </SelectItem>
                                        <SelectItem value="weekly">
                                            Weekly
                                        </SelectItem>
                                        <SelectItem value="monthly">
                                            Monthly
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {createError && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                            <div className="flex items-start gap-2">
                                <RiAlertLine className="mt-0.5 size-4 shrink-0 text-red-400" />
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
                    <DialogFooter>
                        <Button
                            onClick={onClose}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isCreating || !formData.title.trim()}
                            type="submit"
                        >
                            {isCreating ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
