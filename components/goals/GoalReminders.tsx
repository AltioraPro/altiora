"use client";

import { useState } from "react";
import { Bell, BellOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { useToast } from "@/components/ui/toast";

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
  isActive 
}: GoalRemindersProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const utils = api.useUtils();
  const { addToast } = useToast();

  const scheduleReminderMutation = api.reminders.scheduleReminder.useMutation({
    onSuccess: () => {
      addToast({
        type: "success",
        title: "Rappel programmé",
        message: "Vous recevrez des notifications Discord pour cet objectif.",
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

  const handleScheduleReminder = async (frequency: "daily" | "weekly" | "monthly") => {
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
    } else if (diffDays === 1) {
      return "Demain";
    } else if (diffDays > 1) {
      return `Dans ${diffDays} jours`;
    } else {
      return "En retard";
    }
  };

  const frequencyLabels = {
    daily: "Quotidien",
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
  };

  if (!isActive) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <BellOff className="w-4 h-4" />
        <span className="text-sm">Objectif inactif</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {currentFrequency ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-600">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">
              Rappel {frequencyLabels[currentFrequency]} activé
            </span>
          </div>
          
          {nextReminderDate && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Prochain rappel: {formatNextReminder(nextReminderDate)}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelReminders}
            disabled={isCancelling}
            className="w-full"
          >
            {isCancelling ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                Annulation...
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                Désactiver les rappels
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <BellOff className="w-4 h-4" />
            <span className="text-sm">Aucun rappel programmé</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScheduleReminder("daily")}
              disabled={isScheduling}
              className="text-xs"
            >
              Quotidien
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScheduleReminder("weekly")}
              disabled={isScheduling}
              className="text-xs"
            >
              Hebdomadaire
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScheduleReminder("monthly")}
              disabled={isScheduling}
              className="text-xs"
            >
              Mensuel
            </Button>
          </div>

          {isScheduling && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Programmation...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 