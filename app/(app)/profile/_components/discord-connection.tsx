"use client";

import {
    RiArrowRightUpLine,
    RiDiscordFill,
    RiLightbulbFlashLine,
    RiShieldLine,
    RiSparklingLine,
    RiStarLine,
    RiStockLine,
    RiTargetLine,
    RiTrophyLine,
    RiVipCrownLine,
} from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
    const { data: connectionStatus, refetch } = useQuery(
        orpc.discord.getConnectionStatus.queryOptions({
            retry: false,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
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

    const { mutateAsync: getAuthUrl, isPending: isGettingAuthUrl } =
        useMutation(orpc.discord.getAuthUrl.mutationOptions());

    const handleConnect = async () => {
        const { authUrl } = await getAuthUrl({});
        window.location.href = authUrl;
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
        <div className="flex space-x-3 border border-white/10 bg-white/5 p-4 text-sm">
            <RiDiscordFill className="mt-0.5 size-5 text-neutral-400" />
            <div className="flex-1 space-y-1">
                <p className="font-medium text-neutral-50">Discord Connected</p>
                <p className="text-neutral-400">
                    Connect your Discord account to get the latest news and
                    updates
                </p>
            </div>
            <Button size="xs">
                Connect
                <RiArrowRightUpLine className="size-4" />
            </Button>
        </div>
    );
}
