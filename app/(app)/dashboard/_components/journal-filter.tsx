"use client";

import {
    RiArrowDownSLine,
    RiCheckLine,
    RiFilterOffLine,
} from "@remixicon/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { orpc } from "@/orpc/client";
import { dashboardSearchParams } from "../search-params";

export function JournalFilter() {
    const { data: journals } = useSuspenseQuery(
        orpc.trading.getJournalsFilter.queryOptions()
    );

    const [journalIds, setJournalIds] = useQueryState(
        "journalIds",
        dashboardSearchParams.journalIds
    );

    const hasSelection = journalIds && journalIds.length > 0;

    const handleJournalToggle = (journalId: string) => {
        if (!journalIds) {
            // Si aucun journal n'est sélectionné (état par défaut), on sélectionne ce journal
            setJournalIds([journalId]);
        } else if (journalIds.includes(journalId)) {
            // Désélectionner le journal
            const newIds = journalIds.filter((id) => id !== journalId);
            // Si on désélectionne le dernier, on revient à l'état par défaut (null)
            setJournalIds(newIds.length > 0 ? newIds : null);
        } else {
            // Ajouter le journal à la sélection
            setJournalIds([...journalIds, journalId]);
        }
    };

    const handleClearFilter = () => {
        setJournalIds(null);
    };

    const displayText = useMemo(() => {
        if (!hasSelection) {
            return "All journals";
        }
        if (journalIds && journalIds.length === 1) {
            const journal = journals.find((j) => j.id === journalIds[0]);
            return journal?.name || "1 journal selected";
        }
        if (journalIds) {
            return `${journalIds.length} journals selected`;
        }
        return "All journals";
    }, [journalIds, journals, hasSelection]);

    return (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            className="w-48 justify-between"
                            variant="outline"
                        >
                            <span className="font-medium text-sm">
                                {displayText}
                            </span>
                            <RiArrowDownSLine className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="start"
                        className="w-64 rounded-none border-white/10 bg-background p-3"
                    >
                        <div className="space-y-2">
                            {journals.map((journal) => {
                                const isSelected =
                                    journalIds?.includes(journal.id) ?? false;

                                return (
                                    <button
                                        className="flex w-full cursor-pointer items-center p-2 text-left transition-colors hover:bg-white/10"
                                        key={journal.id}
                                        onClick={() =>
                                            handleJournalToggle(journal.id)
                                        }
                                        type="button"
                                    >
                                        <span className="text-sm text-white">
                                            {journal.name}
                                        </span>

                                        {isSelected && (
                                            <RiCheckLine className="ml-auto size-4" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </PopoverContent>
                </Popover>

                {hasSelection && (
                    <Button
                        onClick={handleClearFilter}
                        type="button"
                        variant="ghost"
                    >
                        <RiFilterOffLine className="size-4" />
                        Clear filter
                    </Button>
                )}
            </div>
        </div>
    );
}
