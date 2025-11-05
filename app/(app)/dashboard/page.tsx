"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { GlobalTradingCharts } from "@/components/trading/GlobalTradingCharts";
import { GlobalTradingStats } from "@/components/trading/GlobalTradingStats";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { orpc } from "@/orpc/client";
import { OnboardingContent } from "./_components/onboarding";

export default function GlobalDashboardPage() {
    const [selectedJournalIds, setSelectedJournalIds] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: journals, isLoading: journalsLoading } = useQuery(
        orpc.trading.getJournals.queryOptions({ input: {} })
    );

    const effectiveJournalIds =
        selectedJournalIds.length > 0 ? selectedJournalIds : undefined;

    const { data: stats } = useQuery(
        orpc.trading.getStats.queryOptions({
            input: {
                journalIds: effectiveJournalIds,
            },
        })
    );

    const { data: allTrades } = useQuery(
        orpc.trading.getTrades.queryOptions({
            input: {
                journalIds: effectiveJournalIds,
            },
        })
    );

    const { data: sessions } = useQuery(
        orpc.trading.getSessions.queryOptions({
            input: {
                journalIds: effectiveJournalIds,
            },
        })
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleJournalToggle = (journalId: string) => {
        if (selectedJournalIds.includes(journalId)) {
            setSelectedJournalIds(
                selectedJournalIds.filter((id) => id !== journalId)
            );
        } else {
            setSelectedJournalIds([...selectedJournalIds, journalId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedJournalIds.length === 0) {
            setSelectedJournalIds(journals?.map((j) => j.id) || []);
        } else {
            setSelectedJournalIds([]);
        }
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

    if (journals?.length === 0) {
        return <OnboardingContent />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Navigation */}
            <div className="mb-6 flex items-center space-x-4">
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
                    <h1 className="font-argesta font-bold text-3xl text-white">
                        Global Dashboard
                    </h1>
                    <p className="text-white/60">
                        Overview of all your statistics. Select journals to
                        filter.
                    </p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            className="flex min-w-[200px] items-center justify-between rounded-lg border border-white/15 bg-black/40 px-4 py-2 text-white/80 transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            type="button"
                        >
                            <span className="font-medium text-sm">
                                {selectedJournalIds.length === 0 &&
                                    "All journals"}
                                {selectedJournalIds.length === 1 &&
                                    journals?.find(
                                        (j) => j.id === selectedJournalIds[0]
                                    )?.name}
                                {selectedJournalIds.length > 1 &&
                                    `${selectedJournalIds.length} journals selected`}
                            </span>
                            <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-black/90 shadow-xl backdrop-blur-xs">
                                <div className="space-y-1 p-3">
                                    <div
                                        className="flex cursor-pointer items-center space-x-3 rounded-md p-2 transition-colors hover:bg-white/10"
                                        onClick={handleSelectAll}
                                        title="Select all journals"
                                    >
                                        <Checkbox
                                            checked={
                                                selectedJournalIds.length ===
                                                journals?.length
                                            }
                                            className="border-white/30 bg-black/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                        />
                                        <span className="font-medium text-sm text-white">
                                            All journals
                                        </span>
                                    </div>

                                    {journals?.map((journal) => (
                                        <div
                                            className="flex cursor-pointer items-center space-x-3 rounded-md p-2 transition-colors hover:bg-white/10"
                                            key={journal.id}
                                            onClick={() =>
                                                handleJournalToggle(journal.id)
                                            }
                                        >
                                            <Checkbox
                                                checked={selectedJournalIds.includes(
                                                    journal.id
                                                )}
                                                className="border-white/30 bg-black/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                            />
                                            <span className="text-sm text-white">
                                                {journal.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedJournalIds.length > 0 && (
                        <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1">
                            <span className="font-medium text-sm text-white/80">
                                {selectedJournalIds.length} journal
                                {selectedJournalIds.length > 1 ? "s" : ""}{" "}
                                selected
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="mb-8">
                    <GlobalTradingStats stats={stats} />
                </div>
            )}

            {/* Charts */}
            {stats && sessions && allTrades && (
                <div className="mb-8">
                    <Card className="border border-white/10 bg-black/20">
                        <CardHeader>
                            <CardTitle className="text-white">
                                Performance Charts
                            </CardTitle>
                            <CardDescription className="text-white/60">
                                Visual analysis of your overall performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GlobalTradingCharts
                                sessions={sessions}
                                trades={allTrades}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            <DiscordWelcomeChecker />
        </div>
    );
}
