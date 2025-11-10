"use client";

import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdvancedFilters } from "@/components/trading/AdvancedFilters";
import {
    DateFilter,
    type DateFilterState,
} from "@/components/trading/DateFilter";

interface TradingFiltersBarProps {
    journalId: string | null;
    dateFilter: DateFilterState;
    advancedFilters: {
        sessions: string[];
        setups: string[];
        assets: string[];
    };
    onDateFilterChange: (filter: DateFilterState) => void;
    onAdvancedFiltersChange: (filters: {
        sessions: string[];
        setups: string[];
        assets: string[];
    }) => void;
    onImportClick: () => void;
    onCreateTradeClick: () => void;
}

export function TradingFiltersBar({
    journalId,
    dateFilter,
    advancedFilters,
    onDateFilterChange,
    onAdvancedFiltersChange,
    onImportClick,
    onCreateTradeClick,
}: TradingFiltersBarProps) {
    return (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Filters Section */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                    <DateFilter onFilterChange={onDateFilterChange} />
                    {journalId && (
                        <AdvancedFilters
                            journalId={journalId}
                            onFiltersChange={onAdvancedFiltersChange}
                        />
                    )}
                </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-3">
                <Button
                    className="border-white/20 bg-transparent text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white"
                    onClick={onImportClick}
                    size="sm"
                    variant="outline"
                >
                    <Upload className="mr-2 h-4 w-4" />
                    Import Excel
                </Button>
                <Button
                    className="bg-white font-medium text-black shadow-lg hover:bg-gray-100"
                    onClick={onCreateTradeClick}
                    size="sm"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Trade
                </Button>
            </div>
        </div>
    );
}

