"use client";

import { RiBellFill, RiBellOffLine } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/client";

export function HabitRemindersToggle() {
  const queryClient = useQueryClient();

  const { data: connectionStatus, isLoading: isLoadingStatus } = useQuery(
    orpc.discord.getConnectionStatus.queryOptions({
      retry: false,
      refetchOnWindowFocus: false,
    })
  );

  const { mutateAsync: toggleReminders, isPending: isToggling } = useMutation(
    orpc.discord.toggleHabitReminders.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          orpc.discord.getConnectionStatus.queryOptions()
        );
      },
    })
  );

  if (isLoadingStatus || !connectionStatus?.connected) {
    return null;
  }

  const isEnabled = connectionStatus.habitRemindersEnabled;

  const handleToggle = async () => {
    await toggleReminders({ enabled: !isEnabled });
  };

  return (
    <div className="flex space-x-3 border border-white/10 bg-white/5 p-4 text-sm">
      {isEnabled ? (
        <RiBellFill className="mt-0.5 size-5 text-green-400" />
      ) : (
        <RiBellOffLine className="mt-0.5 size-5 text-neutral-400" />
      )}
      <div className="flex-1 space-y-1">
        <p className="font-medium text-neutral-50">
          {isEnabled ? "Habit Reminders Enabled" : "Habit Reminders Disabled"}
        </p>
        <p className="text-neutral-400">
          {isEnabled
            ? "You will receive a daily Discord reminder at 7 PM (your timezone) for incomplete habits"
            : "Enable to receive daily Discord reminders for your habits at 7 PM in your timezone"}
        </p>
        {connectionStatus.lastHabitReminderSent && isEnabled && (
          <p className="text-xs text-neutral-500">
            Last reminder:{" "}
            {new Date(connectionStatus.lastHabitReminderSent).toLocaleString()}
          </p>
        )}
      </div>
      <Button
        disabled={isToggling}
        onClick={handleToggle}
        size="xs"
        variant={isEnabled ? "destructive" : "primary"}
      >
        {isToggling ? "Updating..." : isEnabled ? "Disable" : "Enable"}
      </Button>
    </div>
  );
}

