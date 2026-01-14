"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/client";

export function SyncAllButton() {
    const [isSyncing, setIsSyncing] = useState(false);
    const queryClient = useQueryClient();

    // Check if there are any cTrader connections
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
        if (!hasConnections) {
            return;
        }

        setIsSyncing(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            // Sync only connected journals
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

            // Invalidate queries
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

    // Don't show button if no cTrader connections
    if (!hasConnections) {
        return null;
    }

    return (
        <Button
            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            disabled={isSyncing}
            onClick={handleSyncAll}
            variant="outline"
        >
            <RefreshCw
                className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Sync..." : "Sync All"}
        </Button>
    );
}
