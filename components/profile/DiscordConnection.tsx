"use client";

import {
    AlertCircle,
    CheckCircle,
    Crown,
    ExternalLink,
    MessageCircle,
    RefreshCw,
    Shield,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Trophy,
    XCircle,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/client";

const rankIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    NEW: Target,
    BEGINNER: Target,
    RISING: TrendingUp,
    CHAMPION: Trophy,
    EXPERT: Star,
    LEGEND: Crown,
    MASTER: Zap,
    GRANDMASTER: Shield,
    IMMORTAL: Sparkles,
};

export function DiscordConnection() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const { data: connectionStatus, refetch } =
        api.discord.getConnectionStatus.useQuery(undefined, {
            retry: false,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        });
    const { data: botStatus } = api.discord.checkBotStatus.useQuery(undefined, {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
    const disconnectMutation = api.discord.disconnect.useMutation();
    const syncRankMutation = api.discord.syncRank.useMutation();
    const autoSyncRankMutation = api.discord.autoSyncRank.useMutation();
    const getAuthUrlMutation = api.discord.getAuthUrl.useMutation();

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const { authUrl } = await getAuthUrlMutation.mutateAsync();
            window.location.href = authUrl;
        } catch (error) {
            console.error("Failed to get auth URL:", error);
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnectMutation.mutateAsync();
            await refetch();
        } catch (error) {
            console.error("Failed to disconnect:", error);
        }
    };

    const handleSyncRank = async () => {
        setIsSyncing(true);
        try {
            await syncRankMutation.mutateAsync();
            await refetch();
        } catch (error) {
            console.error("Failed to sync rank:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleAutoSyncRank = async () => {
        setIsSyncing(true);
        try {
            await autoSyncRankMutation.mutateAsync();
            await refetch();
        } catch (error) {
            console.error("Failed to auto sync rank:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const RankIcon =
        connectionStatus?.currentRank && rankIcons[connectionStatus.currentRank]
            ? rankIcons[connectionStatus.currentRank]
            : Target;

    return (
        <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                    <MessageCircle className="h-5 w-5" />
                    <span>DISCORD INTEGRATION</span>
                </CardTitle>
                <CardDescription className="text-white/60">
                    Connect your Discord account to automatically sync your rank
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {connectionStatus?.connected ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-400" />
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
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-yellow-400" />
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
                                    <RankIcon className="h-4 w-4 text-white/60" />
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
                                disabled={isSyncing}
                                onClick={handleSyncRank}
                                size="sm"
                                variant="outline"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                                />
                                <span>Sync</span>
                            </Button>

                            <Button
                                className="flex items-center space-x-2 border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                disabled={isSyncing || !botStatus?.online}
                                onClick={handleAutoSyncRank}
                                size="sm"
                                variant="outline"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                                />
                                <span>Auto Sync</span>
                            </Button>

                            <Button
                                className="flex items-center space-x-2 border-red-400/20 text-red-400 hover:bg-red-400/10"
                                onClick={handleDisconnect}
                                size="sm"
                                variant="outline"
                            >
                                <XCircle className="h-4 w-4" />
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
                                <ExternalLink className="h-4 w-4" />
                                <span>Join the Discord server</span>
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <XCircle className="h-5 w-5 text-white/40" />
                            <span className="text-white/40">Not connected</span>
                        </div>

                        <div className="space-y-2 text-sm text-white/60">
                            <p>Connect your Discord account to:</p>
                            <ul className="ml-4 space-y-1">
                                <li className="flex items-center space-x-2">
                                    <div className="h-1 w-1 rounded-full bg-white/40" />
                                    <span>Automatically sync your rank</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="h-1 w-1 rounded-full bg-white/40" />
                                    <span>Access exclusive roles</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="h-1 w-1 rounded-full bg-white/40" />
                                    <span>Participate in the community</span>
                                </li>
                            </ul>
                        </div>

                        <Button
                            className="w-full bg-[#5865F2] text-white hover:bg-[#4752C4]"
                            disabled={isConnecting}
                            onClick={handleConnect}
                        >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            {isConnecting
                                ? "Connecting..."
                                : "Connect with Discord"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
