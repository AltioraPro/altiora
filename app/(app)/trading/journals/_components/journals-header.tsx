"use client";

import {
    RiAddLine,
    RiBarChartLine,
    RiCalendarLine,
    RiRefreshLine,
} from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/constants/pages";
import { orpc } from "@/orpc/client";
import { useCreateJournalStore } from "@/store/create-journal-store";

export function JournalsHeader() {
    const { open: openCreateModal } = useCreateJournalStore();
    const [isSyncing, setIsSyncing] = useState(false);
    const queryClient = useQueryClient();

    const { data: connectionsData } = useQuery(
        orpc.integrations.ctrader.getConnections.queryOptions({
            input: {},
            retry: false,
        })
    );

    const { mutateAsync: syncCTrader } = useMutation(
        orpc.integrations.ctrader.syncPositions.mutationOptions({})
    );

    const connections = connectionsData?.connections ?? [];
    const hasConnections = connections.length > 0;

    const handleSyncAll = async () => {
        if (!hasConnections) return;

        setIsSyncing(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const conn of connections) {
                try {
                    await syncCTrader({
                        journalId: conn.journalId,
                        forceRefresh: true,
                    });
                    successCount++;
                } catch {
                    errorCount++;
                }
            }

            if (errorCount === 0) {
                toast.success(`${successCount} journal(s) synced`);
            } else {
                toast.warning(`${successCount} synced, ${errorCount} failed`);
            }

            queryClient.invalidateQueries({
                queryKey: orpc.trading.getJournals.queryKey({ input: {} }),
            });
        } catch (error) {
            console.error("[SyncAll] Error:", error);
            toast.error("Sync failed");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="mb-8">
            {/* Title Section */}
            <div className="mb-6 flex flex-col gap-1">
                <h1 className="font-semibold text-2xl text-white tracking-tight">
                    Trading Journals
                </h1>
                <p className="text-sm text-white/50">
                    Track and analyze your trading performance
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
                {hasConnections && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 text-white/60 hover:bg-white/5 hover:text-white"
                        disabled={isSyncing}
                        onClick={handleSyncAll}
                    >
                        <RiRefreshLine
                            className={`mr-2 size-4 ${isSyncing ? "animate-spin" : ""}`}
                        />
                        {isSyncing ? "Syncing..." : "Sync all"}
                    </Button>
                )}

                {hasConnections && <div className="h-4 w-px bg-white/10" />}

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-white/60 hover:bg-white/5 hover:text-white"
                    asChild
                >
                    <Link href={PAGES.TRADING_CALENDAR}>
                        <RiCalendarLine className="mr-2 size-4" />
                        Calendar
                    </Link>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-white/60 hover:bg-white/5 hover:text-white"
                    asChild
                >
                    <Link href={PAGES.TRADING_DASHBOARD}>
                        <RiBarChartLine className="mr-2 size-4" />
                        Dashboard
                    </Link>
                </Button>

                <div className="ml-auto">
                    <Button
                        onClick={openCreateModal}
                        size="sm"
                        className="h-9 bg-white text-black hover:bg-white/90"
                    >
                        <RiAddLine className="mr-2 size-4" />
                        New Journal
                    </Button>
                </div>
            </div>
        </div>
    );
}
