import { useMutation } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useState } from "react";
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
import { orpc } from "@/orpc/client";
import type { Goal } from "@/server/db/schema";
import { CategorySelector } from "./CategorySelector";

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
        year: goal.deadline
            ? new Date(goal.deadline).getFullYear().toString()
            : new Date().getFullYear().toString(),
        quarter:
            goal.deadline && goal.type === "quarterly"
                ? (`Q${Math.floor(new Date(goal.deadline).getMonth() / 3) + 1}` as
                      | "Q1"
                      | "Q2"
                      | "Q3"
                      | "Q4")
                : ("Q1" as "Q1" | "Q2" | "Q3" | "Q4"),
        categoryId: goal.categoryId || null,
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
            year: goal.deadline
                ? new Date(goal.deadline).getFullYear().toString()
                : new Date().getFullYear().toString(),
            quarter:
                goal.deadline && goal.type === "quarterly"
                    ? (`Q${Math.floor(new Date(goal.deadline).getMonth() / 3) + 1}` as
                          | "Q1"
                          | "Q2"
                          | "Q3"
                          | "Q4")
                    : ("Q1" as "Q1" | "Q2" | "Q3" | "Q4"),
            categoryId: goal.categoryId || null,
            remindersEnabled: goal.remindersEnabled,
            reminderFrequency: goal.reminderFrequency || "weekly",
        });
    }, [goal]);

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

        updateGoalMutation.mutate({
            id: goal.id,
            ...formData,
            type: formData.type as "annual" | "quarterly" | "monthly",
            deadline,
            categoryId: formData.categoryId,
            reminderFrequency: formData.remindersEnabled
                ? (formData.reminderFrequency as "daily" | "weekly" | "monthly")
                : undefined,
        });
    };

    return (
        <Dialog onOpenChange={onClose} open>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Goal</DialogTitle>
                    <DialogDescription>
                        Make changes to your goal
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-title">Goal Title *</Label>
                        <Input
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
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
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

                    {/* Goal Type */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-type">Goal Type</Label>
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
                            <SelectTrigger id="edit-type">
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
                        <Label htmlFor="edit-deadline">
                            {formData.type === "quarterly"
                                ? "Quarter"
                                : formData.type === "annual"
                                  ? "Year"
                                  : "Deadline"}
                        </Label>
                        {formData.type === "annual" ? (
                            <Input
                                id="edit-year"
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
                                        htmlFor="edit-quarter-year"
                                    >
                                        Year
                                    </Label>
                                    <Input
                                        id="edit-quarter-year"
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
                                        htmlFor="edit-quarter"
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
                                        <SelectTrigger id="edit-quarter">
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
                                id="edit-deadline"
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
                                id="edit-remindersEnabled"
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        remindersEnabled: checked as boolean,
                                    })
                                }
                            />
                            <Label
                                className="cursor-pointer"
                                htmlFor="edit-remindersEnabled"
                            >
                                Enable reminders
                            </Label>
                        </div>

                        {formData.remindersEnabled && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-reminderFrequency">
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
                                        <SelectTrigger id="edit-reminderFrequency">
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

                                {/* Next reminder display */}
                                {goal.nextReminderDate && (
                                    <div className="text-muted-foreground text-xs">
                                        Next reminder:{" "}
                                        <span className="text-foreground">
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
                    <DialogFooter>
                        <Button
                            onClick={onClose}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={
                                updateGoalMutation.isPending ||
                                !formData.title.trim()
                            }
                            type="submit"
                        >
                            {updateGoalMutation.isPending
                                ? "Updating..."
                                : "Update"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
