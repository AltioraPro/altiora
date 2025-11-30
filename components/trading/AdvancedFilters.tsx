"use client";

import {
    RiArrowDownSLine,
    RiCheckLine,
    RiFilterLine,
    RiFilterOffLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { memo, useCallback, useMemo } from "react";
import { tradingJournalSearchParams } from "@/app/(app)/trading/journals/[id]/search-params";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { orpc } from "@/orpc/client";

const FILTER_TYPES = {
    sessions: "sessions",
    confirmations: "confirmations",
    assets: "assets",
} as const;

type FilterType = (typeof FILTER_TYPES)[keyof typeof FILTER_TYPES];

interface FilterItem {
    id: string;
    name: string;
}

interface AdvancedFiltersProps {
    journalId: string;
    className?: string;
}

interface FilterSectionProps {
    title: string;
    items: FilterItem[] | undefined;
    selectedIds: string[];
    isLoading: boolean;
    onToggle: (id: string) => void;
}

const FilterSection = memo(function FilterSection({
    title,
    items,
    selectedIds,
    isLoading,
    onToggle,
}: FilterSectionProps) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                <h4 className="font-medium text-white/60 text-xs">{title}</h4>
                <div className="flex items-center justify-center py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                </div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="space-y-2">
                <h4 className="font-medium text-white/60 text-xs">{title}</h4>
                <p className="py-2 text-center text-white/40 text-xs">
                    No {title.toLowerCase()} available
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h4 className="font-medium text-white/60 text-xs">{title}</h4>
            <div className="max-h-32 space-y-1 overflow-y-auto">
                {items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);

                    return (
                        <button
                            className="flex w-full cursor-pointer items-center p-2 text-left transition-colors hover:bg-white/10"
                            key={item.id}
                            onClick={() => onToggle(item.id)}
                            type="button"
                        >
                            <span className="text-sm text-white">
                                {item.name}
                            </span>

                            {isSelected && (
                                <RiCheckLine className="ml-auto size-4" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

function AdvancedFiltersComponent({
    journalId,
    className = "",
}: AdvancedFiltersProps) {
    // URL state management with nuqs
    const [sessions, setSessions] = useQueryState(
        "sessions",
        tradingJournalSearchParams.sessions
    );
    const [confirmations, setConfirmations] = useQueryState(
        "confirmations",
        tradingJournalSearchParams.confirmations
    );
    const [assets, setAssets] = useQueryState(
        "assets",
        tradingJournalSearchParams.assets
    );

    // Queries
    const { data: sessionsData, isLoading: isLoadingSessions } = useQuery(
        orpc.trading.getSessions.queryOptions({ input: { journalId } })
    );
    const { data: confirmationsData, isLoading: isLoadingConfirmations } =
        useQuery(
            orpc.trading.getConfirmations.queryOptions({ input: { journalId } })
        );
    const { data: assetsData, isLoading: isLoadingAssets } = useQuery(
        orpc.trading.getAssets.queryOptions({ input: { journalId } })
    );

    // Toggle handlers
    const handleToggle = useCallback(
        (type: FilterType, id: string) => {
            const setterMap = {
                [FILTER_TYPES.sessions]: setSessions,
                [FILTER_TYPES.confirmations]: setConfirmations,
                [FILTER_TYPES.assets]: setAssets,
            };
            const currentMap = {
                [FILTER_TYPES.sessions]: sessions,
                [FILTER_TYPES.confirmations]: confirmations,
                [FILTER_TYPES.assets]: assets,
            };

            const setter = setterMap[type];
            const current = currentMap[type];

            if (!current) {
                setter([id]);
            } else if (current.includes(id)) {
                const newIds = current.filter((item) => item !== id);
                setter(newIds.length > 0 ? newIds : null);
            } else {
                setter([...current, id]);
            }
        },
        [
            sessions,
            confirmations,
            assets,
            setSessions,
            setConfirmations,
            setAssets,
        ]
    );

    const handleClearAll = useCallback(() => {
        setSessions(null);
        setConfirmations(null);
        setAssets(null);
    }, [setSessions, setConfirmations, setAssets]);

    // Derived values
    const totalFilters = useMemo(
        () =>
            (sessions?.length ?? 0) +
            (confirmations?.length ?? 0) +
            (assets?.length ?? 0),
        [sessions, confirmations, assets]
    );

    const hasFilters = totalFilters > 0;

    const displayText = useMemo(() => {
        if (!hasFilters) {
            return "Filters";
        }
        return `Filters (${totalFilters})`;
    }, [hasFilters, totalFilters]);

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button className="justify-between" variant="outline">
                        <RiFilterLine className="size-4" />
                        <span className="font-medium text-sm">
                            {displayText}
                        </span>
                        <RiArrowDownSLine className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="w-72 rounded-none border-white/10 bg-background p-4"
                >
                    <div className="space-y-4">
                        <FilterSection
                            isLoading={isLoadingSessions}
                            items={sessionsData}
                            onToggle={(id) =>
                                handleToggle(FILTER_TYPES.sessions, id)
                            }
                            selectedIds={sessions ?? []}
                            title="Sessions"
                        />

                        <FilterSection
                            isLoading={isLoadingConfirmations}
                            items={confirmationsData}
                            onToggle={(id) =>
                                handleToggle(FILTER_TYPES.confirmations, id)
                            }
                            selectedIds={confirmations ?? []}
                            title="Confirmations"
                        />

                        <FilterSection
                            isLoading={isLoadingAssets}
                            items={assetsData}
                            onToggle={(id) =>
                                handleToggle(FILTER_TYPES.assets, id)
                            }
                            selectedIds={assets ?? []}
                            title="Assets"
                        />
                    </div>
                </PopoverContent>
            </Popover>

            {hasFilters && (
                <Button onClick={handleClearAll} type="button" variant="ghost">
                    <RiFilterOffLine className="size-4" />
                    Clear filters
                </Button>
            )}
        </div>
    );
}

export const AdvancedFilters = memo(AdvancedFiltersComponent);
