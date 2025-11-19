"use client";

import { RiArrowDownSLine } from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Journal {
    id: string;
    name: string;
}

interface JournalFilterProps {
    journals: Journal[];
}

export function JournalFilter({ journals }: JournalFilterProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedJournalIds, setSelectedJournalIds] = useState<string[]>([]);

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
            setSelectedJournalIds(journals.map((j) => j.id));
        } else {
            setSelectedJournalIds([]);
        }
    };

    return (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
                <div className="relative" ref={dropdownRef}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Open</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={
                                    selectedJournalIds.length ===
                                    journals?.length
                                }
                                onCheckedChange={handleSelectAll}
                            >
                                All journals
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={selectedJournalIds.length === 0}
                                disabled
                                onCheckedChange={() =>
                                    setSelectedJournalIds([])
                                }
                            >
                                None
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={selectedJournalIds.length > 0}
                                onCheckedChange={() =>
                                    setSelectedJournalIds(
                                        journals.map((j) => j.id)
                                    )
                                }
                            >
                                Panel
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button
                        className="flex min-w-[200px] items-center justify-between rounded-lg border border-white/15 bg-black/40 px-4 py-2 text-white/80 transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        type="button"
                    >
                        <span className="font-medium text-sm">
                            {selectedJournalIds.length === 0 && "All journals"}
                            {selectedJournalIds.length === 1 &&
                                journals?.find(
                                    (j) => j.id === selectedJournalIds[0]
                                )?.name}
                            {selectedJournalIds.length > 1 &&
                                `${selectedJournalIds.length} journals selected`}
                        </span>
                        <RiArrowDownSLine
                            className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-black/90 shadow-xl backdrop-blur-xs">
                            <div className="space-y-1 p-3">
                                {/* biome-ignore lint/a11y/useSemanticElements: oui */}
                                <div
                                    className="flex cursor-pointer items-center space-x-3 rounded-md p-2 transition-colors hover:bg-white/10"
                                    onClick={handleSelectAll}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {
                                            e.preventDefault();
                                            handleSelectAll();
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
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
                                    // biome-ignore lint/a11y/useSemanticElements: oui
                                    <div
                                        className="flex cursor-pointer items-center space-x-3 rounded-md p-2 transition-colors hover:bg-white/10"
                                        key={journal.id}
                                        onClick={() =>
                                            handleJournalToggle(journal.id)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                            ) {
                                                e.preventDefault();
                                                handleJournalToggle(journal.id);
                                            }
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        title={journal.name}
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
                            {selectedJournalIds.length > 1 ? "s" : ""} selected
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
