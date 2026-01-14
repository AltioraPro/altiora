"use client";

import {
    RiArrowRightUpLine,
    RiDiscordFill,
    RiNotification3Line,
} from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/orpc/client";

export function DiscordConnection() {
    const searchParams = useSearchParams();
    const hasFinalized = useRef(false);
    const queryClient = useQueryClient();

    const { data: connectionStatus, refetch } = useQuery(
        orpc.discord.getConnectionStatus.queryOptions({
            retry: false,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        })
    );

    const { mutateAsync: disconnect } = useMutation(
        orpc.discord.disconnect.mutationOptions()
    );

    const { mutateAsync: finalizeLink, isPending: isFinalizingLink } =
        useMutation(orpc.discord.finalizeLink.mutationOptions());

    const {
        mutateAsync: toggleHabitReminders,
        isPending: isTogglingReminders,
    } = useMutation(
        orpc.discord.toggleHabitReminders.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(
                    orpc.discord.getConnectionStatus.queryOptions()
                );
            },
        })
    );

    useEffect(() => {
        const discordParam = searchParams.get("discord");

        if (discordParam === "linked" && !hasFinalized.current) {
            hasFinalized.current = true;

            finalizeLink({})
                .then(() => {
                    refetch();
                    if (
                        typeof window !== "undefined" &&
                        window.location?.href
                    ) {
                        try {
                            const url = new URL(window.location.href);
                            url.searchParams.delete("discord");
                            window.history.replaceState({}, "", url.toString());
                        } catch {
                            // Ignore URL cleanup errors
                        }
                    }
                })
                .catch(() => {
                    hasFinalized.current = false;
                });
        }
    }, [searchParams, finalizeLink, refetch]);

    const handleConnect = async () => {
        if (typeof window === "undefined") {
            return;
        }
        const origin = window.location.origin;
        await authClient.linkSocial({
            provider: "discord",
            callbackURL: `${origin}/settings?page=integrations&discord=linked`,
            errorCallbackURL: `${origin}/settings?page=integrations&discord=error`,
        });
    };

    const handleDisconnect = async () => {
        await disconnect({});
        await refetch();
    };

    const handleToggleHabitReminders = async () => {
        const newValue = !(connectionStatus?.habitRemindersEnabled ?? false);
        await toggleHabitReminders({ enabled: newValue });
    };

    const isConnected = connectionStatus?.connected ?? false;
    const isLoading = isFinalizingLink;
    const habitRemindersEnabled =
        connectionStatus?.habitRemindersEnabled ?? false;
    const userTimezone = connectionStatus?.timezone ?? "UTC";

    return (
        <div className="space-y-0">
            {/* Discord Connection Card */}
            <div className="flex space-x-3 border border-white/10 bg-white/5 p-4 text-sm">
                <RiDiscordFill className="mt-0.5 size-5 text-neutral-400" />
                <div className="flex-1 space-y-1">
                    <p className="font-medium text-neutral-50">
                        {(() => {
                            if (isLoading) {
                                return "Connecting Discord...";
                            }
                            if (isConnected) {
                                return "Discord Connected";
                            }
                            return "Discord Not Connected";
                        })()}
                    </p>
                    <p className="text-neutral-400">
                        {(() => {
                            if (isLoading) {
                                return "Finalizing connection with Discord server";
                            }
                            if (isConnected) {
                                return "Your Discord account is connected";
                            }
                            return "Connect your Discord account to get the latest news and updates";
                        })()}
                    </p>
                </div>
                <Button
                    disabled={isLoading}
                    onClick={isConnected ? handleDisconnect : handleConnect}
                    size="xs"
                    variant={isConnected ? "destructive" : "primary"}
                >
                    {(() => {
                        if (isLoading) {
                            return "Connecting...";
                        }
                        if (isConnected) {
                            return "Disconnect";
                        }
                        return "Connect";
                    })()}
                    {!isLoading && <RiArrowRightUpLine className="size-4" />}
                </Button>
            </div>

            {/* Habit Reminders Subcard - Only shown when connected */}
            {isConnected && (
                <div className="border-white/10 border-x border-b bg-white/2 p-4">
                    <div className="flex space-x-3">
                        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md">
                            <RiNotification3Line className="size-4 text-primary" />
                        </div>
                        <div className="flex flex-1 items-center justify-between">
                            <div>
                                <p className="font-medium text-neutral-50 text-sm">
                                    Daily Habit Reminders
                                </p>
                                <p className="mt-0.5 text-neutral-400 text-xs">
                                    Get a daily reminder at 7:00 PM (
                                    {userTimezone}) for incomplete habits
                                </p>
                            </div>
                            <Switch
                                checked={habitRemindersEnabled}
                                disabled={isTogglingReminders}
                                onCheckedChange={handleToggleHabitReminders}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
