"use client";

import { RiArrowRightUpLine, RiDeleteBinLine } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/client";

// Simple cTrader icon as SVG
function CTraderIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-labelledby="ctrader-icon-title"
        >
            <title id="ctrader-icon-title">cTrader</title>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
    );
}

export function CTraderConnection() {
    const queryClient = useQueryClient();

    // Get cTrader OAuth accounts
    const { data: accountsData, isLoading: isLoadingAccounts } = useQuery(
        orpc.integrations.ctrader.getAccounts.queryOptions({
            input: {},
            retry: false,
            refetchOnWindowFocus: false,
        })
    );

    // Get all cTrader broker connections (journals)
    const { data: connectionsData, isLoading: isLoadingConnections } = useQuery(
        orpc.integrations.ctrader.getConnections.queryOptions({
            input: {},
            retry: false,
            refetchOnWindowFocus: false,
        })
    );

    // Disconnect a single journal (also deletes the journal)
    const { mutateAsync: disconnectJournal, isPending: isDisconnectingOne } =
        useMutation(
            orpc.integrations.ctrader.disconnectAccount.mutationOptions({
                onSuccess: () => {
                    queryClient.invalidateQueries(
                        orpc.integrations.ctrader.getConnections.queryOptions({
                            input: {},
                        })
                    );
                    queryClient.invalidateQueries(
                        orpc.trading.getJournals.queryOptions({ input: {} })
                    );
                    toast.success("Journal deleted");
                },
                onError: (error) => {
                    console.error(
                        "[CTraderConnection] Disconnect error:",
                        error
                    );
                    toast.error("Failed to delete journal");
                },
            })
        );

    // Disconnect ALL (also deletes all cTrader journals)
    const { mutateAsync: disconnectAll, isPending: isDisconnectingAll } =
        useMutation(
            orpc.integrations.ctrader.disconnectAll.mutationOptions({
                onSuccess: () => {
                    queryClient.invalidateQueries(
                        orpc.integrations.ctrader.getConnections.queryOptions({
                            input: {},
                        })
                    );
                    queryClient.invalidateQueries(
                        orpc.integrations.ctrader.getAccounts.queryOptions({
                            input: {},
                        })
                    );
                    queryClient.invalidateQueries(
                        orpc.trading.getJournals.queryOptions({ input: {} })
                    );
                    toast.success("All cTrader journals deleted");
                },
                onError: (error) => {
                    console.error(
                        "[CTraderConnection] Disconnect all error:",
                        error
                    );
                    toast.error("Failed to disconnect cTrader");
                },
            })
        );

    const accounts = accountsData?.accounts ?? [];
    const connections = connectionsData?.connections ?? [];
    const hasOAuth = accounts.length > 0;
    const hasConnections = connections.length > 0;
    const isConnected = hasOAuth || hasConnections;
    const isLoading = isLoadingAccounts || isLoadingConnections;
    const isDisconnecting = isDisconnectingOne || isDisconnectingAll;

    const handleConnect = () => {
        window.location.href = "/trading/journals";
    };

    const handleDisconnectJournal = async (
        journalId: string,
        journalName?: string
    ) => {
        if (
            !confirm(
                `Delete "${journalName || journalId}"? This will remove the journal and all its trades.`
            )
        ) {
            return;
        }
        await disconnectJournal({ journalId });
    };

    const handleDisconnectAll = async () => {
        if (
            !confirm(
                "Delete ALL cTrader journals? This will remove all journals linked to cTrader and their trades."
            )
        ) {
            return;
        }
        await disconnectAll({});
    };

    return (
        <div className="space-y-0">
            {/* cTrader Connection Card */}
            <div className="flex space-x-3 border border-white/10 bg-white/5 p-4 text-sm">
                <CTraderIcon className="mt-0.5 size-5 text-neutral-400" />
                <div className="flex-1 space-y-1">
                    <p className="font-medium text-neutral-50">
                        {isLoading
                            ? "Loading..."
                            : isConnected
                              ? "cTrader Connected"
                              : "cTrader Not Connected"}
                    </p>
                    <p className="text-neutral-400">
                        {isLoading
                            ? "Checking connection..."
                            : isConnected
                              ? `${connections.length} journal(s) linked`
                              : "Connect cTrader when creating a new journal"}
                    </p>
                </div>
                {!isConnected && (
                    <Button
                        disabled={isLoading}
                        onClick={handleConnect}
                        size="xs"
                        variant="primary"
                    >
                        Go to Journals
                        <RiArrowRightUpLine className="size-4" />
                    </Button>
                )}
                {isConnected && (
                    <Button
                        disabled={isLoading || isDisconnecting}
                        onClick={handleDisconnectAll}
                        size="xs"
                        variant="destructive"
                    >
                        {isDisconnectingAll ? "..." : "Disconnect All"}
                    </Button>
                )}
            </div>

            {/* Connected Journals List */}
            {hasConnections && (
                <div className="divide-y divide-white/5 border-white/10 border-x border-b bg-white/2">
                    {connections.map((conn) => (
                        <div
                            className="flex items-center justify-between p-3 text-sm"
                            key={conn.id}
                        >
                            <div className="flex-1">
                                <p className="font-medium text-neutral-200">
                                    {conn.journalName}
                                </p>
                                <p className="text-neutral-500 text-xs">
                                    {conn.isActive ? "Active" : "Inactive"}
                                    {conn.lastSyncedAt &&
                                        ` • Last sync: ${new Date(conn.lastSyncedAt).toLocaleDateString()}`}
                                </p>
                            </div>
                            <Button
                                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                disabled={isDisconnecting}
                                onClick={() =>
                                    handleDisconnectJournal(
                                        conn.journalId,
                                        conn.journalName
                                    )
                                }
                                size="xs"
                                variant="ghost"
                            >
                                <RiDeleteBinLine className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Info when OAuth but no journals */}
            {hasOAuth && !hasConnections && (
                <div className="border-white/10 border-x border-b bg-white/2 p-4">
                    <p className="text-neutral-400 text-xs">
                        cTrader OAuth connected, but no journals are linked yet.
                        Create a journal and connect it to cTrader to start
                        syncing trades.
                    </p>
                </div>
            )}
        </div>
    );
}
