"use client";

import { RiFilterLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { TradingJournal } from "@/server/db/schema";

interface TradingDashboardHeaderProps {
    journals: TradingJournal[];
    selectedJournalIds: string[];
    onJournalToggle: (journalId: string) => void;
    onSelectAll: () => void;
    onClearSelection: () => void;
}

export function TradingDashboardHeader({
    journals,
    selectedJournalIds,
    onJournalToggle,
    onSelectAll,
    onClearSelection,
}: TradingDashboardHeaderProps) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="font-bold text-2xl tracking-tight">
                    Trading Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">
                    {selectedJournalIds.length === 0
                        ? "All journals"
                        : `${selectedJournalIds.length} journal${selectedJournalIds.length > 1 ? "s" : ""} selected`}
                </p>
            </div>

            <div className="group relative">
                <Button variant="outline" className="rounded-none">
                    <RiFilterLine className="mr-2 size-4" />
                    Filter Journals
                    {selectedJournalIds.length > 0 && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-none bg-primary font-medium text-primary-foreground text-xs">
                            {selectedJournalIds.length}
                        </span>
                    )}
                </Button>

                {journals && journals.length > 0 && (
                    <div className="pointer-events-none absolute top-full right-0 z-50 mt-2 w-64 rounded-none border bg-popover shadow-lg opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                        <div className="p-3">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-medium text-sm">
                                    Select Journals
                                </h3>
                                <div className="flex gap-1">
                                    <Button
                                        className="h-6 px-2 text-xs rounded-none"
                                        onClick={onSelectAll}
                                        size="sm"
                                        variant="ghost"
                                    >
                                        All
                                    </Button>
                                    <Button
                                        className="h-6 px-2 text-xs rounded-none"
                                        onClick={onClearSelection}
                                        size="sm"
                                        variant="ghost"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                            <div className="max-h-48 space-y-2 overflow-y-auto">
                                {journals.map((journal) => (
                                    <button
                                        className="flex w-full cursor-pointer items-center gap-2 rounded-none p-1.5 text-left transition-colors hover:bg-secondary border-none bg-transparent"
                                        key={journal.id}
                                        onClick={() =>
                                            onJournalToggle(journal.id)
                                        }
                                        type="button"
                                    >
                                        <Checkbox
                                            checked={selectedJournalIds.includes(
                                                journal.id
                                            )}
                                            className="pointer-events-none"
                                        />
                                        <span className="truncate font-medium text-sm">
                                            {journal.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Invisible bridge to prevent dropdown from closing */}
                        <div className="-top-2 pointer-events-auto absolute right-0 left-0 h-2" />
                    </div>
                )}
            </div>
        </div>
    );
}
