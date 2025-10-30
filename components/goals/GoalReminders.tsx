"use client";

import { Bell, BellOff, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/trpc/client";

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
    const [isScheduling, setIsScheduling] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const utils = api.useUtils();
    const { addToast } = useToast();

    const scheduleReminderMutation = api.reminders.scheduleReminder.useMutation(
        {
            onSuccess: () => {
                addToast({
                    type: "success",
                    title: "Rappel programmé",
                    message:
                        "Vous recevrez des notifications Discord pour cet objectif.",
                });
                utils.goals.getAll.invalidate();
            },
            onError: (error) => {
                addToast({
                    type: "error",
                    title: "Erreur",
                    message: error.message,
                });
            },
        }
    );

    const cancelRemindersMutation = api.reminders.cancelReminders.useMutation({
        onSuccess: () => {
            addToast({
                type: "success",
                title: "Rappels annulés",
                message: "Les rappels pour cet objectif ont été désactivés.",
            });
            utils.goals.getAll.invalidate();
        },
        onError: (error) => {
            addToast({
                type: "error",
                title: "Erreur",
                message: error.message,
            });
        },
    });

    const handleScheduleReminder = async (
        frequency: "daily" | "weekly" | "monthly"
    ) => {
        setIsScheduling(true);
        try {
            await scheduleReminderMutation.mutateAsync({
                goalId,
                frequency,
            });
        } finally {
            setIsScheduling(false);
        }
    };

    const handleCancelReminders = async () => {
        setIsCancelling(true);
        try {
            await cancelRemindersMutation.mutateAsync({ goalId });
        } finally {
            setIsCancelling(false);
        }
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
                <BellOff className="h-4 w-4" />
                <span className="text-sm">Objectif inactif</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {currentFrequency ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                        <Bell className="h-4 w-4" />
                        <span className="font-medium text-sm">
                            Rappel {frequencyLabels[currentFrequency]} activé
                        </span>
                    </div>

                    {nextReminderDate && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">
                                Prochain rappel:{" "}
                                {formatNextReminder(nextReminderDate)}
                            </span>
                        </div>
                    )}

                    <Button
                        className="w-full"
                        disabled={isCancelling}
                        onClick={handleCancelReminders}
                        size="sm"
                        variant="outline"
                    >
                        {isCancelling ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                                Annulation...
                            </>
                        ) : (
                            <>
                                <BellOff className="mr-2 h-4 w-4" />
                                Désactiver les rappels
                            </>
                        )}
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                        <BellOff className="h-4 w-4" />
                        <span className="text-sm">Aucun rappel programmé</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            className="text-xs"
                            disabled={isScheduling}
                            onClick={() => handleScheduleReminder("daily")}
                            size="sm"
                            variant="outline"
                        >
                            Quotidien
                        </Button>
                        <Button
                            className="text-xs"
                            disabled={isScheduling}
                            onClick={() => handleScheduleReminder("weekly")}
                            size="sm"
                            variant="outline"
                        >
                            Hebdomadaire
                        </Button>
                        <Button
                            className="text-xs"
                            disabled={isScheduling}
                            onClick={() => handleScheduleReminder("monthly")}
                            size="sm"
                            variant="outline"
                        >
                            Mensuel
                        </Button>
                    </div>

                    {isScheduling && (
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
