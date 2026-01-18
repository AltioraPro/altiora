"use client";

import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConnectMetaTraderDialog } from "@/components/integrations";
import { CreateTradeModal } from "@/components/trading/create-trade-modal";
import type { DateRangeFilterState } from "@/components/trading/DateRangeFilter";
import { JournalDashboard } from "@/components/trading/JournalDashboard";
import { orpc, type RouterOutput } from "@/orpc/client";
import { EmptyTradingState } from "../../_components/empty-trading-state";
import { TradingContent } from "../../_components/trading-content";
import { TradingFiltersBar } from "../../_components/trading-filters-bar";
import { TradingPageHeader } from "../../_components/trading-page-header";
import { tradingJournalSearchParams } from "./search-params";

function useAdvancedFiltersState() {
    const [sessions] = useQueryState(
        "sessions",
        tradingJournalSearchParams.sessions
    );
    const [confirmations] = useQueryState(
        "confirmations",
        tradingJournalSearchParams.confirmations
    );
    const [assets] = useQueryState("assets", tradingJournalSearchParams.assets);

    return useMemo(
        () => ({
            sessions: sessions ?? [],
            confirmations: confirmations ?? [],
            assets: assets ?? [],
        }),
        [sessions, confirmations, assets]
    );
}

interface SerializedDateRange {
    from: string | null | undefined;
    to: string | null | undefined;
}

function useDateRangeState() {
    const [serializedRange, setSerializedRange] = useQueryState(
        "dateRange",
        tradingJournalSearchParams.dateRange
    );

    // Convert serialized strings to Date objects
    const dateRange: DateRangeFilterState = useMemo(
        () => ({
            from: serializedRange?.from
                ? new Date(serializedRange.from)
                : undefined,
            to: serializedRange?.to ? new Date(serializedRange.to) : undefined,
        }),
        [serializedRange]
    );

    // Convert Date objects to serialized strings
    const setDateRange = useCallback(
        (range: DateRangeFilterState) => {
            const serialized: SerializedDateRange = {
                from: range.from?.toISOString() ?? null,
                to: range.to?.toISOString() ?? null,
            };
            setSerializedRange(serialized);
        },
        [setSerializedRange]
    );

    return [dateRange, setDateRange] as const;
}

function useDateRangeStrings(dateRange: DateRangeFilterState) {
    return useMemo(() => {
        const hasDateFilter =
            dateRange.from !== undefined || dateRange.to !== undefined;

        if (!hasDateFilter) {
            return { startDate: undefined, endDate: undefined };
        }

        return {
            startDate: dateRange.from?.toISOString().split("T")[0],
            endDate: dateRange.to?.toISOString().split("T")[0],
        };
    }, [dateRange]);
}

function filterTradesByDateRange(
    trades: RouterOutput["trading"]["getTrades"] | undefined,
    dateRange: DateRangeFilterState
) {
    if (!trades) {
        return trades;
    }

    const hasDateFilter =
        dateRange.from !== undefined || dateRange.to !== undefined;
    if (!hasDateFilter) {
        return trades;
    }

    return trades.filter((trade) => {
        const tradeDate = new Date(trade.tradeDate);
        tradeDate.setHours(0, 0, 0, 0);

        if (dateRange.from && dateRange.to) {
            const from = new Date(dateRange.from);
            from.setHours(0, 0, 0, 0);
            const to = new Date(dateRange.to);
            to.setHours(23, 59, 59, 999);
            return tradeDate >= from && tradeDate <= to;
        }

        if (dateRange.from) {
            const from = new Date(dateRange.from);
            from.setHours(0, 0, 0, 0);
            return tradeDate >= from;
        }

        if (dateRange.to) {
            const to = new Date(dateRange.to);
            to.setHours(23, 59, 59, 999);
            return tradeDate <= to;
        }

        return true;
    });
}

interface JournalPageClientProps {
    journalId: string;
}

export function JournalPageClient({ journalId }: JournalPageClientProps) {
    const searchParams = useSearchParams();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isMetaTraderDialogOpen, setIsMetaTraderDialogOpen] = useState(false);

    // Auto-open MetaTrader dialog when redirected from journal creation
    useEffect(() => {
        if (searchParams.get("setup") === "metatrader") {
            setIsMetaTraderDialogOpen(true);
            // Clear the query param without triggering navigation
            const newUrl = window.location.pathname;
            window.history.replaceState({}, "", newUrl);
        }
    }, [searchParams]);

    const activeTab = "trades";

    const [dateRange, setDateRange] = useDateRangeState();

    // Read advanced filters from URL state
    const advancedFilters = useAdvancedFiltersState();

    const { data: journal } = useSuspenseQuery(
        orpc.trading.getJournalById.queryOptions({ input: { id: journalId } })
    );

    // Check if journal has broker connection
    const { data: brokerConnection } = useQuery(
        orpc.integrations.getBrokerConnection.queryOptions({
            input: { journalId },
        })
    );

    // Auto-sync on journal load if connected to broker
    const { mutateAsync: syncCTrader } = useMutation(
        orpc.integrations.ctrader.syncPositions.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getTrades.queryKey({ input: { journalId } }),
                    orpc.trading.getStats.queryKey({ input: { journalId } }),
                ],
            },
        })
    );

    // Auto-sync when journal loads
    useEffect(() => {
        if (
            brokerConnection?.isActive &&
            brokerConnection?.provider === "ctrader"
        ) {
            setIsSyncing(true);
            syncCTrader({ journalId })
                .then(() => {})
                .catch((error) => {
                    console.error("[Auto-sync] Sync failed:", error);
                })
                .finally(() => {
                    setIsSyncing(false);
                });
        }
    }, [
        journalId,
        brokerConnection?.isActive,
        brokerConnection?.provider,
        syncCTrader,
    ]);

    const handleManualSync = async () => {
        if (!brokerConnection?.isActive) {
            return;
        }

        setIsSyncing(true);
        try {
            await syncCTrader({ journalId });
            // Success handled by invalidation
        } catch (error) {
            console.error("Manual sync failed:", error);
        } finally {
            setIsSyncing(false);
        }
    };
    const dateRangeStrings = useDateRangeStrings(dateRange);

    const { data: allTrades } = useSuspenseQuery(
        orpc.trading.getTrades.queryOptions({
            input: {
                journalId,
                sessionIds: advancedFilters.sessions,
                confirmationIds: advancedFilters.confirmations,
                assetIds: advancedFilters.assets,
                startDate: dateRangeStrings.startDate,
                endDate: dateRangeStrings.endDate,
            },
        })
    );

    const filteredTrades = useMemo(
        () => filterTradesByDateRange(allTrades, dateRange),
        [allTrades, dateRange]
    );

    const { data: stats } = useSuspenseQuery(
        orpc.trading.getStats.queryOptions({
            input: {
                journalId,
                sessionIds: advancedFilters.sessions,
                confirmationIds: advancedFilters.confirmations,
                assetIds: advancedFilters.assets,
                startDate: dateRangeStrings.startDate,
                endDate: dateRangeStrings.endDate,
            },
        })
    );

    const { data: sessions } = useSuspenseQuery(
        orpc.trading.getSessions.queryOptions({
            input: { journalId },
        })
    );

    const createJournalMutation = useMutation(
        orpc.trading.createJournal.mutationOptions()
    );

    const handleCreateDefaultJournal = async () => {
        await createJournalMutation.mutateAsync({
            name: "Main Journal",
            description: "My main trading journal",
            usePercentageCalculation: false,
        });
    };

    const handleOpenCreateModal = useCallback(() => {
        setIsCreateModalOpen(true);
    }, []);

    const handleCloseCreateModal = useCallback(() => {
        setIsCreateModalOpen(false);
    }, []);

    if (!journal) {
        return (
            <EmptyTradingState
                isCreating={createJournalMutation.isPending}
                onCreateJournal={handleCreateDefaultJournal}
            />
        );
    }

    return (
        <div className="px-6 py-6">
            <TradingPageHeader
                journalDescription={journal.description || undefined}
                journalName={journal.name}
            />

            <TradingFiltersBar
                dateRange={dateRange}
                isSyncing={isSyncing}
                journalId={journalId}
                onCreateTradeClick={handleOpenCreateModal}
                onDateRangeChange={setDateRange}
                onSyncClick={
                    brokerConnection?.isActive ? handleManualSync : undefined
                }
            />

            {stats && filteredTrades && sessions && (
                <JournalDashboard
                    stats={stats}
                    trades={filteredTrades}
                    sessions={sessions}
                />
            )}

            <TradingContent activeTab={activeTab} journalId={journalId} />

            <CreateTradeModal
                isOpen={isCreateModalOpen}
                journalId={journalId}
                onClose={handleCloseCreateModal}
            />

            <ConnectMetaTraderDialog
                journalId={journalId}
                onOpenChange={setIsMetaTraderDialogOpen}
                open={isMetaTraderDialogOpen}
            />
        </div>
    );
}
