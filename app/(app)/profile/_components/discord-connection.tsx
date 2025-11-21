"use client";

import { RiArrowRightUpLine, RiDiscordFill } from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/orpc/client";

export function DiscordConnection() {
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

    const handleConnect = async () => {
        if (typeof window === "undefined") {
            return;
        }
        const origin = window.location.origin;
        await authClient.linkSocial({
            provider: "discord",
            callbackURL: `${origin}/profile?discord=linked`,
            errorCallbackURL: `${origin}/profile?discord=error`,
        });
    };

    const handleDisconnect = async () => {
        await disconnect({});
        await refetch();
    };

    const isConnected = connectionStatus?.connected ?? false;

    return (
        <div className="flex space-x-3 border border-white/10 bg-white/5 p-4 text-sm">
            <RiDiscordFill className="mt-0.5 size-5 text-neutral-400" />
            <div className="flex-1 space-y-1">
                <p className="font-medium text-neutral-50">
                    {isConnected
                        ? "Discord Connected"
                        : "Discord Not Connected"}
                </p>
                <p className="text-neutral-400">
                    {isConnected
                        ? "Your Discord account is connected"
                        : "Connect your Discord account to get the latest news and updates"}
                </p>
            </div>
            <Button
                onClick={isConnected ? handleDisconnect : handleConnect}
                size="xs"
                variant={isConnected ? "destructive" : "primary"}
            >
                {isConnected ? "Disconnect" : "Connect"}
                <RiArrowRightUpLine className="size-4" />
            </Button>
        </div>
    );
}
