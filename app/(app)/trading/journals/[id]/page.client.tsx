"use client";

import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { CreateTradeModal } from "@/components/trading/create-trade-modal";
import type { DateFilterState } from "@/components/trading/DateFilter";
import { ImportTradesModal } from "@/components/trading/ImportTradesModal";
import { TradingStats } from "@/components/trading/TradingStats";
import { orpc } from "@/orpc/client";
import type { AdvancedTrade } from "@/server/db/schema";
import { EmptyTradingState } from "../../_components/empty-trading-state";
import { TradingContent } from "../../_components/trading-content";
import { TradingFiltersBar } from "../../_components/trading-filters-bar";
import { TradingPageHeader } from "../../_components/trading-page-header";
import { TradingTabs } from "../../_components/trading-tabs";
import { tradingJournalSearchParams } from "./search-params";

function useDateRange(dateFilter: DateFilterState) {
    return useMemo(() => {
        if (dateFilter.view === "all") {
            return { startDate: undefined, endDate: undefined };
        }

        if (
            dateFilter.view === "monthly" &&
            dateFilter.month &&
            dateFilter.year
        ) {
            const monthNames = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            const monthIndex = monthNames.indexOf(dateFilter.month);
            const year = Number.parseInt(dateFilter.year, 10);

            const startDate = new Date(year, monthIndex, 1);
            const endDate = new Date(year, monthIndex + 1, 0);

            return {
                startDate: startDate.toISOString().split("T")[0],
                endDate: endDate.toISOString().split("T")[0],
            };
        }

        if (dateFilter.view === "yearly" && dateFilter.year) {
            const year = Number.parseInt(dateFilter.year, 10);
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);

            return {
                startDate: startDate.toISOString().split("T")[0],
                endDate: endDate.toISOString().split("T")[0],
            };
        }

        return { startDate: undefined, endDate: undefined };
    }, [dateFilter]);
}

function filterTradesByDate(
    trades: AdvancedTrade[] | undefined,
    dateFilter: DateFilterState
) {
    if (!trades || dateFilter.view === "all") {
        return trades;
    }

    return trades.filter((trade) => {
        const tradeDate = new Date(trade.tradeDate);

        switch (dateFilter.view) {
            case "monthly": {
                if (!(dateFilter.month && dateFilter.year)) {
                    return true;
                }
                const monthNames = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ];
                const monthIndex = monthNames.indexOf(dateFilter.month);
                return (
                    tradeDate.getFullYear() ===
                    Number.parseInt(dateFilter.year, 10) &&
                    tradeDate.getMonth() === monthIndex
                );
            }

            case "yearly":
                if (!dateFilter.year) {
                    return true;
                }
                return (
                    tradeDate.getFullYear() ===
                    Number.parseInt(dateFilter.year, 10)
                );

            default:
                return true;
        }
    });
}

function calculateCumulativePerformance(trades: AdvancedTrade[]) {
    return trades
        .sort(
            (a, b) =>
                new Date(a.tradeDate).getTime() -
                new Date(b.tradeDate).getTime()
        )
        .reduce(
            (acc, trade) => {
                const pnl = Number(trade.profitLossPercentage);
                const previousCumulative =
                    acc.length > 0 ? acc.at(-1)?.cumulative || 0 : 0;
                const cumulative = previousCumulative + pnl;
                acc.push({ cumulative });
                return acc;
            },
            [] as Array<{ cumulative: number }>
        );
}

type TradingStatsType = {
    totalTrades: number;
    closedTrades: number;
    totalPnL: string | number;
    avgPnL: string | number;
    totalAmountPnL?: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    tradesBySymbol: Array<{
        assetId?: string | null;
        symbol?: string | null;
        count: number;
        totalPnL: string | null;
    }>;
    tradesBySetup: Array<{
        setupId: string | null;
        count: number;
        totalPnL: string | null;
    }>;
    tpTrades: number;
    beTrades: number;
    slTrades: number;
    journal?: {
        usePercentageCalculation?: boolean;
        startingCapital?: string;
    };
};

function calculateStatsFromTrades(
    filteredTrades: AdvancedTrade[] | undefined,
    totalPerformance: number,
    selectedJournal:
        | {
            usePercentageCalculation?: boolean;
            startingCapital?: string | null;
        }
        | undefined,
    backendStats: TradingStatsType | undefined
): TradingStatsType | null {
    if (filteredTrades && filteredTrades.length > 0) {
        const winningTrades = filteredTrades.filter(
            (t) => Number(t.profitLossPercentage) > 0
        ).length;
        const losingTrades = filteredTrades.filter(
            (t) => Number(t.profitLossPercentage) < 0
        ).length;
        const winRate =
            filteredTrades.length > 0
                ? (winningTrades / filteredTrades.length) * 100
                : 0;

        const calculateTotalAmountPnL = () => {
            if (!filteredTrades) {
                return 0;
            }

            if (
                selectedJournal?.usePercentageCalculation &&
                selectedJournal?.startingCapital
            ) {
                const startingCapital = Number.parseFloat(
                    selectedJournal.startingCapital
                );
                return (totalPerformance / 100) * startingCapital;
            }

            return filteredTrades.reduce(
                (sum, t) => sum + Number(t.profitLossAmount || 0),
                0
            );
        };

        return {
            totalTrades: filteredTrades.length,
            closedTrades: filteredTrades.length,
            winningTrades,
            losingTrades,
            winRate,
            totalPnL: totalPerformance,
            avgPnL:
                filteredTrades.length > 0
                    ? totalPerformance / filteredTrades.length
                    : 0,
            totalAmountPnL: calculateTotalAmountPnL(),
            tradesBySymbol: [],
            tradesBySetup: [],
            tpTrades: filteredTrades.filter((t) => t.exitReason === "TP")
                .length,
            beTrades: filteredTrades.filter((t) => t.exitReason === "BE")
                .length,
            slTrades: filteredTrades.filter((t) => t.exitReason === "SL")
                .length,
            journal: selectedJournal
                ? {
                    usePercentageCalculation:
                        selectedJournal.usePercentageCalculation,
                    startingCapital:
                        selectedJournal.startingCapital || undefined,
                }
                : undefined,
        };
    }
    return backendStats ?? null;
}

interface JournalPageClientProps {
    journalId: string;
}

export function JournalPageClient({ journalId }: JournalPageClientProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useQueryState(
        "tab",
        tradingJournalSearchParams.tab
    );

    const [dateFilter, setDateFilter] = useQueryState(
        "dateFilter",
        tradingJournalSearchParams.dateFilter
    );

    const [advancedFilters, setAdvancedFilters] = useState<{
        sessions: string[];
        setups: string[];
        assets: string[];
    }>({ sessions: [], setups: [], assets: [] });

    const { data: journal } = useSuspenseQuery(
        orpc.trading.getJournalById.queryOptions({ input: { id: journalId } })
    );

    const dateRange = useDateRange(dateFilter);

    const { data: allTrades } = useSuspenseQuery(
        orpc.trading.getTrades.queryOptions({
            input: {
                journalId,
                sessionIds: advancedFilters.sessions,
                setupIds: advancedFilters.setups,
                assetIds: advancedFilters.assets,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            },
        })
    );

    const filteredTrades = useMemo(
        () => filterTradesByDate(allTrades, dateFilter),
        [allTrades, dateFilter]
    );

    const { data: backendStats } = useSuspenseQuery(
        orpc.trading.getStats.queryOptions({
            input: {
                journalId,
                sessionIds: advancedFilters.sessions,
                setupIds: advancedFilters.setups,
                assetIds: advancedFilters.assets,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            },
        })
    );

    const { data: sessions } = useQuery(
        orpc.trading.getSessions.queryOptions({
            input: { journalId },
        })
    );

    const { data: setups } = useQuery(
        orpc.trading.getSetups.queryOptions({
            input: { journalId },
        })
    );

    const cumulativeData = useMemo(
        () =>
            filteredTrades
                ? calculateCumulativePerformance(filteredTrades)
                : [],
        [filteredTrades]
    );

    const totalPerformance =
        cumulativeData.length > 0 ? cumulativeData.at(-1)?.cumulative || 0 : 0;

    const stats = useMemo(
        () =>
            calculateStatsFromTrades(
                filteredTrades,
                totalPerformance,
                journal,
                backendStats
            ),
        [filteredTrades, totalPerformance, journal, backendStats]
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

    if (!journal) {
        return (
            <EmptyTradingState
                isCreating={createJournalMutation.isPending}
                onCreateJournal={handleCreateDefaultJournal}
            />
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <TradingPageHeader
                journalDescription={journal.description || undefined}
                journalName={journal.name}
            />

            <TradingFiltersBar
                advancedFilters={advancedFilters}
                dateFilter={dateFilter}
                journalId={journalId}
                onAdvancedFiltersChange={setAdvancedFilters}
                onCreateTradeClick={() => setIsCreateModalOpen(true)}
                onDateFilterChange={setDateFilter}
                onImportClick={() => setIsImportModalOpen(true)}
            />

            {stats && <TradingStats className="mb-8" stats={stats} />}

            <TradingTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <TradingContent
                activeTab={activeTab}
                dateFilter={dateFilter}
                filteredTrades={filteredTrades}
                journalId={journalId}
                sessions={sessions}
                setups={setups}
                stats={stats}
            />

            <CreateTradeModal
                isOpen={isCreateModalOpen}
                journalId={journalId}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <ImportTradesModal
                isOpen={isImportModalOpen}
                journalId={journalId}
                onClose={() => setIsImportModalOpen(false)}
            />
        </div>
    );
}
