"use client";

import { RiAddLine, RiUploadLine, RiRefreshLine, RiLink } from "@remixicon/react";
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
    onImportClick: () => void;
    onCreateTradeClick: () => void;
    onSyncClick?: () => void;
    isSyncing?: boolean;
    /** URL to connect broker (shown when no broker is connected) */
    brokerConnectUrl?: string;
}

export function TradingFiltersBar({
    journalId,
    dateRange,
    onDateRangeChange,
    onImportClick,
    onCreateTradeClick,
    onSyncClick,
    isSyncing,
    brokerConnectUrl,
}: TradingFiltersBarProps) {
    const handleConnectBroker = () => {
        if (brokerConnectUrl) {
            window.location.href = brokerConnectUrl;
        }
    };

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
                {onSyncClick ? (
                    <Button
                        onClick={onSyncClick}
                        variant="outline"
                        disabled={isSyncing}
                    >
                        <RiRefreshLine className={`size-4 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Syncing..." : "Sync"}
                    </Button>
                ) : brokerConnectUrl ? (
                    <Button
                        onClick={handleConnectBroker}
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                    >
                        <RiLink className="size-4" />
                        Connect cTrader
                    </Button>
                ) : null}
                <Button onClick={onImportClick} variant="outline">
                    <RiUploadLine className="size-4" />
                    Import Excel
                </Button>
                <Button onClick={onCreateTradeClick}>
                    <RiAddLine className="size-4" />
                    New Trade
                </Button>
            </div>
        </div>
    );
}
