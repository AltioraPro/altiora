"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { AdvancedFilters } from "@/components/trading/AdvancedFilters";
import { AssetsManager } from "@/components/trading/AssetsManager";
import { CreateTradeModal } from "@/components/trading/CreateTradeModal";
import {
    DateFilter,
    type DateFilterState,
} from "@/components/trading/DateFilter";
import { ImportTradesModal } from "@/components/trading/ImportTradesModal";
import { SessionsManager } from "@/components/trading/SessionsManager";
import { SetupsManager } from "@/components/trading/SetupsManager";
import { TradesTable } from "@/components/trading/TradesTable";
import { TradingCharts } from "@/components/trading/TradingCharts";
import { TradingStats } from "@/components/trading/TradingStats";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { orpc } from "@/orpc/client";
import type { AdvancedTrade } from "@/server/db/schema";

function JournalParamSync({
    onFound,
}: {
    onFound: (journalId: string) => void;
}) {
    const searchParams = useSearchParams();
    useEffect(() => {
        const journalFromUrl =
            searchParams.get("journalId") || searchParams.get("journal");
        if (journalFromUrl) {
            onFound(journalFromUrl);
        }
    }, [searchParams, onFound]);
    return null;
}

export default function TradingPage() {
    const { data: session } = useSession();
    const [selectedJournalId, setSelectedJournalId] = useState<string | null>(
        null
    );
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<
        "trades" | "assets" | "sessions" | "setups"
    >("trades");
    const [dateFilter, setDateFilter] = useState<DateFilterState>({
        view: "all",
    });
    const [advancedFilters, setAdvancedFilters] = useState<{
        sessions: string[];
        setups: string[];
        assets: string[];
    }>({ sessions: [], setups: [], assets: [] });

    const dateRange = useMemo(() => {
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

    const filterTradesByDate = (trades: AdvancedTrade[] | undefined) => {
        if (!trades || dateFilter.view === "all") {
            return trades;
        }

        return trades.filter((trade) => {
            const tradeDate = new Date(trade.tradeDate);

            switch (dateFilter.view) {
                case "monthly":
                    if (!(dateFilter.month && dateFilter.year)) {
                        return true;
                    }
                    return (
                        tradeDate.getFullYear() ===
                            Number.parseInt(dateFilter.year, 10) &&
                        tradeDate.getMonth() ===
                            Number.parseInt(dateFilter.month, 10)
                    );

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
    };

    const { data: journals, isLoading: journalsLoading } = useQuery(
        orpc.trading.getJournals.queryOptions()
    );

    const selectedJournal = journals?.find((j) => j.id === selectedJournalId);

    const { data: allTrades } = useQuery(
        orpc.trading.getTrades.queryOptions({
            input: {
                journalId: selectedJournalId || undefined,
                sessionIds:
                    advancedFilters.sessions.length > 0
                        ? advancedFilters.sessions
                        : undefined,
                setupIds:
                    advancedFilters.setups.length > 0
                        ? advancedFilters.setups
                        : undefined,
                assetIds:
                    advancedFilters.assets.length > 0
                        ? advancedFilters.assets
                        : undefined,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                enabled: !!selectedJournalId,
            },
        })
    );

    const filteredTrades = allTrades
        ? filterTradesByDate(allTrades)
        : undefined;

    const { data: backendStats } = useQuery(
        orpc.trading.getStats.queryOptions({
            input: {
                journalId: selectedJournalId || undefined,
                sessionIds:
                    advancedFilters.sessions.length > 0
                        ? advancedFilters.sessions
                        : undefined,
                setupIds:
                    advancedFilters.setups.length > 0
                        ? advancedFilters.setups
                        : undefined,
                assetIds:
                    advancedFilters.assets.length > 0
                        ? advancedFilters.assets
                        : undefined,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                enabled: !!selectedJournalId,
            },
        })
    );

    const calculateCumulativePerformance = (trades: AdvancedTrade[]) =>
        trades
            .sort(
                (a, b) =>
                    new Date(a.tradeDate).getTime() -
                    new Date(b.tradeDate).getTime()
            )
            .reduce(
                (acc, trade) => {
                    const pnl = trade.profitLossPercentage
                        ? Number.parseFloat(trade.profitLossPercentage) || 0
                        : 0;
                    const previousCumulative =
                        acc.length > 0 ? (acc.at(-1)?.cumulative ?? 0) : 0;
                    const cumulative = previousCumulative + pnl;
                    acc.push({ cumulative });
                    return acc;
                },
                [] as Array<{ cumulative: number }>
            );

    const cumulativeData = filteredTrades
        ? calculateCumulativePerformance(filteredTrades)
        : [];
    const totalPerformance =
        cumulativeData.length > 0
            ? (cumulativeData.at(-1)?.cumulative ?? 0)
            : 0;

    // Calcul des streaks
    const calculateStreaks = (trades: AdvancedTrade[]) => {
        let currentWinningStreak = 0;
        let currentLosingStreak = 0;
        let maxWinningStreak = 0;
        let maxLosingStreak = 0;

        const sortedTrades = trades
            .filter((t) => t.isClosed)
            .sort((a, b) => {
                const dateA = new Date(a.tradeDate).getTime();
                const dateB = new Date(b.tradeDate).getTime();
                if (dateA !== dateB) {
                    return dateA - dateB;
                }
                // Si même date, trier par createdAt
                return (
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                );
            });

        for (const trade of sortedTrades) {
            const pnl = Number.parseFloat(trade.profitLossPercentage || "0");

            if (pnl > 0) {
                currentWinningStreak++;
                currentLosingStreak = 0;
                maxWinningStreak = Math.max(
                    maxWinningStreak,
                    currentWinningStreak
                );
            } else if (pnl < 0) {
                currentLosingStreak++;
                currentWinningStreak = 0;
                maxLosingStreak = Math.max(
                    maxLosingStreak,
                    currentLosingStreak
                );
            } else {
                // Trade BE - interrompt les streaks
                currentWinningStreak = 0;
                currentLosingStreak = 0;
            }
        }

        return {
            currentWinningStreak,
            currentLosingStreak,
            maxWinningStreak,
            maxLosingStreak,
        };
    };

    const streaks = filteredTrades
        ? calculateStreaks(filteredTrades)
        : {
              currentWinningStreak: 0,
              currentLosingStreak: 0,
              maxWinningStreak: 0,
              maxLosingStreak: 0,
          };

    const stats =
        (filteredTrades && filteredTrades.length > 0
            ? {
                  totalTrades: filteredTrades.length,
                  closedTrades: filteredTrades.length,
                  winningTrades: filteredTrades.filter(
                      (t) => Number(t.profitLossPercentage || 0) > 0
                  ).length,
                  losingTrades: filteredTrades.filter(
                      (t) => Number(t.profitLossPercentage || 0) < 0
                  ).length,
                  winRate:
                      filteredTrades && filteredTrades.length > 0
                          ? (filteredTrades.filter(
                                (t) => Number(t.profitLossPercentage || 0) > 0
                            ).length /
                                filteredTrades.length) *
                            100
                          : 0,
                  totalPnL: totalPerformance,
                  avgPnL:
                      filteredTrades && filteredTrades.length > 0
                          ? totalPerformance / filteredTrades.length
                          : 0,
                  avgGain: (() => {
                      const tp = filteredTrades.filter(
                          (t) => t.exitReason === "TP"
                      );
                      if (tp.length === 0) {
                          return 0;
                      }
                      const sum = tp.reduce(
                          (s, t) =>
                              s +
                              (t.profitLossPercentage
                                  ? Number.parseFloat(t.profitLossPercentage) ||
                                    0
                                  : 0),
                          0
                      );
                      return sum / tp.length;
                  })(),
                  avgLoss: (() => {
                      const sl = filteredTrades.filter(
                          (t) => t.exitReason === "SL"
                      );
                      if (sl.length === 0) {
                          return 0;
                      }
                      const sum = sl.reduce(
                          (s, t) =>
                              s +
                              (t.profitLossPercentage
                                  ? Number.parseFloat(t.profitLossPercentage) ||
                                    0
                                  : 0),
                          0
                      );
                      return Math.abs(sum / sl.length);
                  })(),
                  totalAmountPnL: (() => {
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
                  })(),
                  tradesBySymbol: [],
                  tradesBySetup: [],
                  tpTrades: filteredTrades.filter((t) => t.exitReason === "TP")
                      .length,
                  beTrades: filteredTrades.filter((t) => t.exitReason === "BE")
                      .length,
                  slTrades: filteredTrades.filter((t) => t.exitReason === "SL")
                      .length,
                  currentWinningStreak: streaks.currentWinningStreak,
                  currentLosingStreak: streaks.currentLosingStreak,
                  maxWinningStreak: streaks.maxWinningStreak,
                  maxLosingStreak: streaks.maxLosingStreak,
                  journal: selectedJournal
                      ? {
                            usePercentageCalculation:
                                selectedJournal.usePercentageCalculation,
                            startingCapital:
                                selectedJournal.startingCapital || undefined,
                        }
                      : undefined,
              }
            : null) || backendStats;

    const { data: sessions } = useQuery(
        orpc.trading.getSessions.queryOptions({
            input: { journalId: selectedJournalId || undefined },
            enabled: !!selectedJournalId,
        })
    );

    const { data: setups } = useQuery(
        orpc.trading.getSetups.queryOptions({
            input: { journalId: selectedJournalId || undefined },
            enabled: !!selectedJournalId,
        })
    );

    const { mutateAsync: createJournal, isPending: isCreatingJournal } =
        useMutation(orpc.trading.createJournal.mutationOptions());

    const handleJournalFound = useCallback((journalId: string) => {
        setSelectedJournalId(journalId);
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const journalFromUrl =
            urlParams.get("journalId") || urlParams.get("journal");

        if (
            !(selectedJournalId || journalFromUrl) &&
            journals &&
            journals.length > 0
        ) {
            setSelectedJournalId(journals[0].id);
        }
    }, [journals, selectedJournalId]);

    const handleCreateDefaultJournal = async () => {
        if (!session?.user?.id) {
            return;
        }

        await createJournal({
            name: "Main Journal",
            description: "My main trading journal",
        });
    };

    if (journalsLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="mb-6 h-8 w-1/4 rounded bg-gray-200" />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {new Array(4).map((_, i) => (
                            <div className="h-32 rounded bg-gray-200" key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!journals || journals.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-8">
                        <h1 className="mb-4 font-argesta font-bold text-4xl text-white">
                            Trading Dashboard
                        </h1>
                        <p className="text-white/60">
                            Start your trading journey by creating your first
                            journal
                        </p>
                    </div>

                    <Card className="border border-white/10 bg-black/20 p-8">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                            <BarChart3 className="h-8 w-8 text-white/60" />
                        </div>
                        <h3 className="mb-4 text-white text-xl">
                            No Journal Created
                        </h3>
                        <p className="mb-8 text-white/60">
                            Create your first trading journal to start tracking
                            your performance.
                        </p>

                        <Button
                            className="bg-white text-black hover:bg-gray-200"
                            disabled={isCreatingJournal}
                            onClick={handleCreateDefaultJournal}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create First Journal
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={null}>
                <JournalParamSync onFound={handleJournalFound} />
            </Suspense>
            {/* Header Navigation */}
            <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Link href="/trading/journals">
                    <Button
                        className="text-white/70 hover:bg-white/10 hover:text-white"
                        size="sm"
                        variant="ghost"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Journals
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="font-argesta font-bold text-2xl text-white sm:text-3xl">
                        {selectedJournal
                            ? selectedJournal.name
                            : "Trading Dashboard"}
                    </h1>
                    <p className="text-sm text-white/60 sm:text-base">
                        {selectedJournal
                            ? selectedJournal.description ||
                              "Performance analytics & trade management"
                            : "Performance analytics & trade management"}
                    </p>
                </div>
            </div>

            {/* Filters and Actions Bar */}
            <div className="mb-8 flex flex-col gap-4">
                {/* Filters Section */}
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <DateFilter onFilterChange={setDateFilter} />
                        {selectedJournalId && (
                            <AdvancedFilters
                                journalId={selectedJournalId}
                                onFiltersChange={setAdvancedFilters}
                            />
                        )}
                    </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-3">
                    <Button
                        className="w-full border-white/20 bg-transparent text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white sm:w-auto"
                        onClick={() => setIsImportModalOpen(true)}
                        size="sm"
                        variant="outline"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Import Excel
                    </Button>
                    <Button
                        className="w-full bg-white font-medium text-black shadow-lg hover:bg-gray-100 sm:w-auto"
                        onClick={() => setIsCreateModalOpen(true)}
                        size="sm"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Trade
                    </Button>
                </div>
            </div>

            <JournalParamSync onFound={handleJournalFound} />

            {stats && (
                <div className="mb-8">
                    <TradingStats stats={stats} />
                </div>
            )}

            {selectedJournalId && (
                <div className="mb-8">
                    <div className="flex space-x-1 rounded-xl border border-white/10 bg-black/20 p-1.5">
                        {[
                            { id: "trades", label: "Trades", icon: BarChart3 },
                            { id: "assets", label: "Assets", icon: Plus },
                            { id: "sessions", label: "Sessions", icon: Plus },
                            { id: "setups", label: "Setups", icon: Plus },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                className={`flex items-center space-x-2 rounded-lg px-5 py-3 font-medium text-sm transition-all duration-200 ${
                                    activeTab === id
                                        ? "bg-white text-black shadow-sm"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                                key={id}
                                onClick={() =>
                                    setActiveTab(
                                        id as
                                            | "trades"
                                            | "assets"
                                            | "sessions"
                                            | "setups"
                                    )
                                }
                                type="button"
                            >
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {stats &&
                sessions &&
                filteredTrades &&
                setups &&
                activeTab === "trades" && (
                    <div className="mb-8">
                        <Card className="border border-white/10 bg-black/20">
                            <CardHeader>
                                <CardTitle className="text-white">
                                    Performance Charts
                                </CardTitle>
                                <CardDescription className="text-white/60">
                                    Visual analysis of your trading performance
                                    {dateFilter.view !== "all" &&
                                        filteredTrades &&
                                        ` (${filteredTrades.length} trades)`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TradingCharts
                                    sessions={sessions}
                                    stats={stats}
                                    trades={filteredTrades || []}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}

            {selectedJournalId && (
                <>
                    {activeTab === "trades" && (
                        <TradesTable journalId={selectedJournalId} />
                    )}

                    {activeTab === "assets" && (
                        <AssetsManager journalId={selectedJournalId} />
                    )}

                    {activeTab === "sessions" && (
                        <SessionsManager journalId={selectedJournalId} />
                    )}

                    {activeTab === "setups" && (
                        <SetupsManager journalId={selectedJournalId} />
                    )}
                </>
            )}

            <CreateTradeModal
                isOpen={isCreateModalOpen}
                journalId={selectedJournalId || undefined}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <ImportTradesModal
                isOpen={isImportModalOpen}
                journalId={selectedJournalId || undefined}
                onClose={() => setIsImportModalOpen(false)}
            />
        </div>
    );
}
