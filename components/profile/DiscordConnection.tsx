"use client";

import {
    RiAlertLine,
    RiCheckLine,
    RiCloseCircleLine,
    RiExternalLinkLine,
    RiLightbulbFlashLine,
    RiMessageLine,
    RiRefreshLine,
    RiShieldLine,
    RiSparklingLine,
    RiStarLine,
    RiStockLine,
    RiTargetLine,
    RiTrophyLine,
    RiVipCrownLine,
    RiXingLine,
} from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";

const rankIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    NEW: RiTargetLine,
    BEGINNER: RiTargetLine,
    RISING: RiStockLine,
    CHAMPION: RiTrophyLine,
    EXPERT: RiStarLine,
    LEGEND: RiVipCrownLine,
    MASTER: RiLightbulbFlashLine,
    GRANDMASTER: RiShieldLine,
    IMMORTAL: RiSparklingLine,
};

export function DiscordConnection() {
    const searchParams = useSearchParams();
    const [linkError, setLinkError] = useState<string | null>(null);
    const [isStartingLink, setIsStartingLink] = useState(false);
    const { data: connectionStatus, refetch } = useQuery(
        orpc.discord.getConnectionStatus.queryOptions({
            retry: false,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
        })
    );

    const { data: botStatus } = useQuery(
        orpc.discord.checkBotStatus.queryOptions({
            retry: false,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        })
    );

    const { mutateAsync: disconnect } = useMutation(
        orpc.discord.disconnect.mutationOptions()
    );
    const { mutateAsync: syncRank, isPending: isSyncingRank } = useMutation(
        orpc.discord.syncRank.mutationOptions()
    );
    const { mutateAsync: autoSyncRank, isPending: isAutoSyncingRank } =
        useMutation(orpc.discord.autoSyncRank.mutationOptions());
    const {
        mutateAsync: finalizeDiscordLink,
        isPending: isFinalizingLink,
    } = useMutation(orpc.discord.finalizeLink.mutationOptions());

    const clearDiscordQuery = () => {
        if (typeof window === "undefined") {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        params.delete("discord");
        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""
            }`;
        window.history.replaceState({}, "", nextUrl);
    };

    useEffect(() => {
        if (!searchParams) {
            return;
        }
        const status = searchParams.get("discord");
        if (status === "linked") {
            (async () => {
                try {
                    setLinkError(null);
                    await finalizeDiscordLink({});
                    await refetch();
                } catch {
                    setLinkError("Unable to finalize the Discord connection.");
                } finally {
                    clearDiscordQuery();
                }
            })();
        } else if (status === "error") {
            setLinkError("Discord authorization failed. Please try again.");
            clearDiscordQuery();
        }
    }, [searchParams, finalizeDiscordLink, refetch]);

    const handleConnect = async () => {
        if (typeof window === "undefined") {
            return;
        }
        setLinkError(null);
        setIsStartingLink(true);
        try {
            const origin = window.location.origin;
            await authClient.linkSocial({
                provider: "discord",
                callbackURL: `${origin}/settings?discord=linked`,
                errorCallbackURL: `${origin}/settings?discord=error`,
            });
        } catch {
            setIsStartingLink(false);
            setLinkError("Unable to start the Discord authorization flow.");
        }
    };

    const handleDisconnect = async () => {
        await disconnect({});
        await refetch();
    };

    const handleSyncRank = async () => {
        await syncRank({});
        await refetch();
    };

    const handleAutoSyncRank = async () => {
        await autoSyncRank({});
        await refetch();
    };

    const RankIcon =
        connectionStatus?.currentRank && rankIcons[connectionStatus.currentRank]
            ? rankIcons[connectionStatus.currentRank]
            : RiTargetLine;

    return (
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xs">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                    <RiMessageLine className="size-5" />
                    <span>DISCORD INTEGRATION</span>
                </CardTitle>
                <CardDescription className="text-white/60">
                    Connect your Discord account to automatically sync your rank
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {linkError && (
                    <div className="flex items-start space-x-3 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
                        <RiAlertLine className="mt-0.5 size-4 shrink-0" />
                        <span>{linkError}</span>
                    </div>
                )}
                {connectionStatus?.connected ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <RiCheckLine className="size-5 text-green-400" />
                                <span className="font-medium text-green-400">
                                    Connected
                                </span>
                            </div>
                            <Badge className="text-white/60" variant="outline">
                                {connectionStatus.username}#
                                {connectionStatus.discriminator}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {connectionStatus.roleSynced ? (
                                    <RiCheckLine className="size-5 text-green-400" />
                                ) : (
                                    <RiAlertLine className="size-5 text-yellow-400" />
                                )}
                                <span
                                    className={
                                        connectionStatus.roleSynced
                                            ? "text-green-400"
                                            : "text-yellow-400"
                                    }
                                >
                                    {connectionStatus.roleSynced
                                        ? "Role synced"
                                        : "Role not synced"}
                                </span>
                            </div>

                            {connectionStatus.currentRank && (
                                <div className="flex items-center space-x-2">
                                    <RankIcon className="size-4 text-white/60" />
                                    <span className="text-sm text-white/60">
                                        {connectionStatus.currentRank}
                                    </span>
                                </div>
                            )}
                        </div>

                        {connectionStatus.lastSync && (
                            <div className="text-white/40 text-xs">
                                Last sync:{" "}
                                {new Date(
                                    connectionStatus.lastSync
                                ).toLocaleString("en-US")}
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <Button
                                className="flex items-center space-x-2"
                                disabled={isSyncingRank || isAutoSyncingRank}
                                onClick={handleSyncRank}
                                size="sm"
                                variant="outline"
                            >
                                <RiRefreshLine
                                    className={cn(
                                        "size-4",
                                        isSyncingRank || isAutoSyncingRank
                                            ? "animate-spin"
                                            : ""
                                    )}
                                />
                                <span>Sync</span>
                            </Button>

                            <Button
                                className="flex items-center space-x-2 border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                disabled={
                                    isSyncingRank ||
                                    isAutoSyncingRank ||
                                    !botStatus?.online
                                }
                                onClick={handleAutoSyncRank}
                                size="sm"
                                variant="outline"
                            >
                                <RiRefreshLine
                                    className={cn(
                                        "size-4",
                                        isSyncingRank || isAutoSyncingRank
                                            ? "animate-spin"
                                            : ""
                                    )}
                                />
                                <span>Auto Sync</span>
                            </Button>

                            <Button
                                className="flex items-center space-x-2 border-red-400/20 text-red-400 hover:bg-red-400/10"
                                onClick={handleDisconnect}
                                size="sm"
                                variant="outline"
                            >
                                <RiCloseCircleLine className="size-4" />
                                <span>Disconnect</span>
                            </Button>
                        </div>

                        <div className="border-white/10 border-t pt-2">
                            <a
                                className="inline-flex items-center space-x-2 text-sm text-white/60 transition-colors hover:text-white"
                                href="https://discord.gg/altiora"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <RiExternalLinkLine className="size-4" />
                                <span>Join the Discord server</span>
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <RiXingLine className="size-5 text-white/40" />
                            <span className="text-white/40">Not connected</span>
                        </div>

                        <div className="space-y-2 text-sm text-white/60">
                            <p>Connect your Discord account to:</p>
                            <ul className="ml-4 space-y-1">
                                <li className="flex items-center space-x-2">
                                    <div className="size-1 rounded-full bg-white/40" />
                                    <span>Automatically sync your rank</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="size-1 rounded-full bg-white/40" />
                                    <span>Access exclusive roles</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="size-1 rounded-full bg-white/40" />
                                    <span>Participate in the community</span>
                                </li>
                            </ul>
                        </div>

                        <Button
                            className="w-full bg-[#5865F2] text-white hover:bg-[#4752C4]"
                            disabled={isStartingLink || isFinalizingLink}
                            onClick={handleConnect}
                        >
                            <RiMessageLine className="mr-2 size-4" />
                            {isStartingLink || isFinalizingLink
                                ? "Connecting..."
                                : "Connect with Discord"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
