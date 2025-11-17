"use client";

import {
    RiBellLine,
    RiNotificationOffLine,
    RiTimeLine,
} from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { orpc } from "@/orpc/client";

interface GoalRemindersProps {
    goalId: string;
    currentFrequency?: "daily" | "weekly" | "monthly" | null;
    nextReminderDate?: Date | null;
    isActive: boolean;
}

export function GoalReminders({
    goalId,
    currentFrequency,
    nextReminderDate,
    isActive,
}: GoalRemindersProps) {
    const { addToast } = useToast();

    const { mutateAsync: scheduleReminder, isPending: isSchedulingReminders } =
        useMutation(
            orpc.reminders.scheduleReminder.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.goals.getAll.queryKey({ input: {} }),
                    ],
                },
                onSuccess: () => {
                    addToast({
                        type: "success",
                        title: "Rappel programmé",
                        message:
                            "Vous recevrez des notifications Discord pour cet objectif.",
                    });
                },
                onError: (error) => {
                    addToast({
                        type: "error",
                        title: "Erreur",
                        message: error.message,
                    });
                },
            })
        );

    const { mutateAsync: cancelReminders, isPending: isCancellingReminders } =
        useMutation(
            orpc.reminders.cancelReminders.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.goals.getAll.queryKey({ input: {} }),
                    ],
                },
                onSuccess: () => {
                    addToast({
                        type: "success",
                        title: "Rappels annulés",
                        message:
                            "Les rappels pour cet objectif ont été désactivés.",
                    });
                },
                onError: (error) => {
                    addToast({
                        type: "error",
                        title: "Erreur",
                        message: error.message,
                    });
                },
            })
        );

    const handleScheduleReminder = async (
        frequency: "daily" | "weekly" | "monthly"
    ) => {
        await scheduleReminder({
            goalId,
            frequency,
        });
    };

    const handleCancelReminders = async () => {
        await cancelReminders({ goalId });
    };

    const formatNextReminder = (date: Date) => {
        const now = new Date();
        const reminderDate = new Date(date);
        const diffTime = reminderDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return "Aujourd'hui";
        }
        if (diffDays === 1) {
            return "Demain";
        }
        if (diffDays > 1) {
            return `Dans ${diffDays} jours`;
        }
        return "En retard";
    };

    const frequencyLabels = {
        daily: "Quotidien",
        weekly: "Hebdomadaire",
        monthly: "Mensuel",
    };

    if (!isActive) {
        return (
            <div className="flex items-center gap-2 text-gray-500">
                <RiNotificationOffLine className="size-4" />
                <span className="text-sm">Objectif inactif</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {currentFrequency ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                        <RiBellLine className="size-4" />
                        <span className="font-medium text-sm">
                            Rappel {frequencyLabels[currentFrequency]} activé
                        </span>
                    </div>

                    {nextReminderDate && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <RiTimeLine className="size-4" />
                            <span className="text-sm">
                                Prochain rappel:{" "}
                                {formatNextReminder(nextReminderDate)}
                            </span>
                        </div>
                    )}

                    <Button
                        className="w-full"
                        disabled={isCancellingReminders}
                        onClick={handleCancelReminders}
                        size="sm"
                        variant="outline"
                    >
                        {isCancellingReminders ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                                Annulation...
                            </>
                        ) : (
                            <>
                                <RiNotificationOffLine className="size-4" />
                                Désactiver les rappels
                            </>
                        )}
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                        <RiNotificationOffLine className="size-4" />
                        <span className="text-sm">Aucun rappel programmé</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            className="text-xs"
                            disabled={isSchedulingReminders}
                            onClick={() => handleScheduleReminder("daily")}
                            size="sm"
                            variant="outline"
                        >
                            Quotidien
                        </Button>
                        <Button
                            className="text-xs"
                            disabled={isSchedulingReminders}
                            onClick={() => handleScheduleReminder("weekly")}
                            size="sm"
                            variant="outline"
                        >
                            Hebdomadaire
                        </Button>
                        <Button
                            className="text-xs"
                            disabled={isSchedulingReminders}
                            onClick={() => handleScheduleReminder("monthly")}
                            size="sm"
                            variant="outline"
                        >
                            Mensuel
                        </Button>
                    </div>

                    {isSchedulingReminders && (
                        <div className="flex items-center gap-2 text-blue-600">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                            <span className="text-sm">Programmation...</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
