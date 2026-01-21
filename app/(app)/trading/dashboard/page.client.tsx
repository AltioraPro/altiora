"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { orpc } from "@/orpc/client";
import { TradingDashboardHeader } from "./_components/trading-dashboard-header";
import { TradingDashboardLayout } from "./_components/trading-dashboard-layout";

export function TradingDashboardClient() {
    const [selectedJournalIds, setSelectedJournalIds] = useState<string[]>([]);

    const { data: journals } = useSuspenseQuery(
        orpc.trading.getJournals.queryOptions({ input: {} })
    );

    const queryInput = useMemo(() => {
        if (selectedJournalIds.length === 0) {
            return {};
        }
        if (selectedJournalIds.length === 1) {
            return { journalId: selectedJournalIds[0] };
        }
        return { journalIds: selectedJournalIds };
    }, [selectedJournalIds]);

    const { data: stats } = useSuspenseQuery(
        orpc.trading.getStats.queryOptions({ input: queryInput })
    );

    const { data: trades } = useSuspenseQuery(
        orpc.trading.getTrades.queryOptions({ input: queryInput })
    );

    const handleJournalToggle = (journalId: string) => {
        setSelectedJournalIds((prev) =>
            prev.includes(journalId)
                ? prev.filter((id) => id !== journalId)
                : [...prev, journalId]
        );
    };

    const handleSelectAll = () => {
        setSelectedJournalIds(journals.map((j) => j.id));
    };

    const handleClearSelection = () => {
        setSelectedJournalIds([]);
    };

    return (
        <div className="px-6 py-8">
            <TradingDashboardHeader
                journals={journals}
                selectedJournalIds={selectedJournalIds}
                onJournalToggle={handleJournalToggle}
                onSelectAll={handleSelectAll}
                onClearSelection={handleClearSelection}
            />
            <TradingDashboardLayout stats={stats} trades={trades} />
        </div>
    );
}
