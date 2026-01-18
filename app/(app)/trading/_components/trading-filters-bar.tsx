"use client";

import { RiAddLine, RiRefreshLine } from "@remixicon/react";
import { BrokerConnectMenu } from "@/components/integrations";
import { AdvancedFilters } from "@/components/trading/AdvancedFilters";
import {
    DateRangeFilter,
    type DateRangeFilterState,
} from "@/components/trading/DateRangeFilter";
import { Button } from "@/components/ui/button";

interface TradingFiltersBarProps {
    journalId: string | null;
    dateRange: DateRangeFilterState;
    onDateRangeChange: (range: DateRangeFilterState) => void;
    onCreateTradeClick: () => void;
    onSyncClick?: () => void;
    isSyncing?: boolean;
}

export function TradingFiltersBar({
    journalId,
    dateRange,
    onDateRangeChange,
    onCreateTradeClick,
    onSyncClick,
    isSyncing,
}: TradingFiltersBarProps) {
    return (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Filters Section */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                    <DateRangeFilter
                        onChange={onDateRangeChange}
                        value={dateRange}
                    />
                    {journalId && <AdvancedFilters journalId={journalId} />}
                </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-3">
                {/* Broker Connection Menu */}
                {journalId && <BrokerConnectMenu journalId={journalId} />}

                {/* Manual Sync Button (shown when connected) */}
                {onSyncClick && (
                    <Button
                        disabled={isSyncing}
                        onClick={onSyncClick}
                        variant="outline"
                    >
                        <RiRefreshLine
                            className={`size-4 ${isSyncing ? "animate-spin" : ""}`}
                        />
                        {isSyncing ? "Syncing..." : "Sync"}
                    </Button>
                )}

                <Button onClick={onCreateTradeClick}>
                    <RiAddLine className="size-4" />
                    New Trade
                </Button>
            </div>
        </div>
    );
}
