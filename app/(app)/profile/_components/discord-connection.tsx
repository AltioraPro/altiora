"use client";

import { RiArrowRightUpLine, RiDiscordFill } from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/orpc/client";

export function DiscordConnection() {
    const searchParams = useSearchParams();
    const hasFinalized = useRef(false);

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

    useEffect(() => {
        const discordParam = searchParams.get("discord");

        if (discordParam === "linked" && !hasFinalized.current) {
            hasFinalized.current = true;

            finalizeLink({})
                .then(() => {
                    refetch();
                    if (typeof window !== "undefined" && window.location?.href) {
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

    const isConnected = connectionStatus?.connected ?? false;
    const isLoading = isFinalizingLink;

    return (
        <div className="flex space-x-3 border border-white/10 bg-white/5 p-4 text-sm">
            <RiDiscordFill className="mt-0.5 size-5 text-neutral-400" />
            <div className="flex-1 space-y-1">
                <p className="font-medium text-neutral-50">
                    {isLoading
                        ? "Connecting Discord..."
                        : isConnected
                            ? "Discord Connected"
                            : "Discord Not Connected"}
                </p>
                <p className="text-neutral-400">
                    {isLoading
                        ? "Finalizing connection with Discord server"
                        : isConnected
                            ? "Your Discord account is connected"
                            : "Connect your Discord account to get the latest news and updates"}
                </p>
            </div>
            <Button
                disabled={isLoading}
                onClick={isConnected ? handleDisconnect : handleConnect}
                size="xs"
                variant={isConnected ? "destructive" : "primary"}
            >
                {isLoading
                    ? "Connecting..."
                    : isConnected
                        ? "Disconnect"
                        : "Connect"}
                {!isLoading && <RiArrowRightUpLine className="size-4" />}
            </Button>
        </div>
    );
}
