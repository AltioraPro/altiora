"use client";

import {
    Award,
    CheckCircle,
    Clock,
    Filter,
    Search,
    Target,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface GoalFiltersProps {
    search: string;
    onSearchChange: (search: string) => void;
    filters: {
        status: "all" | "active" | "completed" | "overdue";
        type: "all" | "annual" | "quarterly" | "monthly";
        hasReminders: boolean | null;
    };
    onFiltersChange: (filters: {
        status: "all" | "active" | "completed" | "overdue";
        type: "all" | "annual" | "quarterly" | "monthly";
        hasReminders: boolean | null;
    }) => void;
}

export function GoalFilters({
    search,
    onSearchChange,
    filters,
    onFiltersChange,
}: GoalFiltersProps) {
    const [localSearch, setLocalSearch] = useState(search);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const filtersRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(localSearch);
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearch, onSearchChange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                filtersRef.current &&
                !filtersRef.current.contains(event.target as Node)
            ) {
                setIsFiltersOpen(false);
            }
        };

        if (isFiltersOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isFiltersOpen]);

    const clearSearch = () => {
        setLocalSearch("");
        onSearchChange("");
    };

    const clearAllFilters = () => {
        onFiltersChange({
            status: "all",
            type: "all",
            hasReminders: null,
        });
        setLocalSearch("");
        onSearchChange("");
    };

    const hasActiveFilters =
        filters.status !== "all" ||
        filters.type !== "all" ||
        filters.hasReminders !== null ||
        localSearch;

    return (
        <div className="flex items-center gap-3">
            {/* Barre de recherche */}
            <div className="relative max-w-md flex-1">
                <div className="relative">
                    <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-white/50" />
                    <input
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pr-10 pl-10 text-white placeholder-white/50 transition-all duration-200 focus:border-white/20 focus:outline-hidden focus:ring-2 focus:ring-white/20"
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="Search goals..."
                        type="text"
                        value={localSearch}
                    />
                    {localSearch && (
                        <button
                            className="-translate-y-1/2 absolute top-1/2 right-3 transform text-white/50 transition-colors duration-200 hover:text-white/80"
                            onClick={clearSearch}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Bouton filtres */}
            <div className="relative">
                <Button
                    className={`border-white/20 bg-white/10 text-white transition-all duration-200 hover:bg-white/20 ${
                        hasActiveFilters ? "border-white/30 bg-white/20" : ""
                    }`}
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    size="sm"
                    variant="outline"
                >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                        <div className="ml-2 h-2 w-2 rounded-full bg-white/80" />
                    )}
                </Button>

                {/* Panneau de filtres */}
                {isFiltersOpen && (
                    <div
                        className="absolute top-full right-0 z-9999 mt-2 w-80 rounded-xl border border-white/10 bg-neutral-900 p-4 shadow-2xl"
                        ref={filtersRef}
                    >
                        <div className="space-y-4">
                            {/* En-tête */}
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white">
                                    Filters & Sort
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        className="text-sm text-white/60 transition-colors hover:text-white/80"
                                        onClick={clearAllFilters}
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Tri par type */}
                            <div>
                                <label className="mb-2 block font-medium text-sm text-white/80">
                                    Sort by Type
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: "all", label: "All" },
                                        { value: "annual", label: "Annual" },
                                        {
                                            value: "quarterly",
                                            label: "Quarterly",
                                        },
                                        { value: "monthly", label: "Monthly" },
                                    ].map(({ value, label }) => (
                                        <button
                                            className={`rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                                                filters.type === value
                                                    ? "border border-white/30 bg-white/20 text-white"
                                                    : "border border-transparent bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                                            }`}
                                            key={value}
                                            onClick={() =>
                                                onFiltersChange({
                                                    ...filters,
                                                    type: value as
                                                        | "all"
                                                        | "annual"
                                                        | "quarterly"
                                                        | "monthly",
                                                })
                                            }
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filtre par statut */}
                            <div>
                                <label className="mb-2 block font-medium text-sm text-white/80">
                                    Status
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        {
                                            value: "all",
                                            label: "All",
                                            icon: Target,
                                        },
                                        {
                                            value: "active",
                                            label: "Active",
                                            icon: Clock,
                                        },
                                        {
                                            value: "completed",
                                            label: "Completed",
                                            icon: CheckCircle,
                                        },
                                        {
                                            value: "overdue",
                                            label: "Overdue",
                                            icon: Award,
                                        },
                                    ].map(({ value, label, icon: Icon }) => (
                                        <button
                                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                                                filters.status === value
                                                    ? "border border-white/30 bg-white/20 text-white"
                                                    : "border border-transparent bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                                            }`}
                                            key={value}
                                            onClick={() =>
                                                onFiltersChange({
                                                    ...filters,
                                                    status: value as
                                                        | "all"
                                                        | "active"
                                                        | "completed"
                                                        | "overdue",
                                                })
                                            }
                                        >
                                            <Icon className="h-4 w-4" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filtre par rappels */}
                            <div>
                                <label className="mb-2 block font-medium text-sm text-white/80">
                                    Reminders
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: null, label: "All" },
                                        {
                                            value: true,
                                            label: "With reminders",
                                        },
                                        { value: false, label: "No reminders" },
                                    ].map(({ value, label }) => (
                                        <button
                                            className={`rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                                                filters.hasReminders === value
                                                    ? "border border-white/30 bg-white/20 text-white"
                                                    : "border border-transparent bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                                            }`}
                                            key={
                                                value === null
                                                    ? "all"
                                                    : value.toString()
                                            }
                                            onClick={() =>
                                                onFiltersChange({
                                                    ...filters,
                                                    hasReminders: value,
                                                })
                                            }
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Indicateurs de filtres actifs */}
                            {hasActiveFilters && (
                                <div className="border-white/10 border-t pt-3">
                                    <div className="flex flex-wrap gap-2">
                                        {filters.status !== "all" && (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-white/80 text-xs">
                                                {filters.status}
                                                <button
                                                    className="hover:text-white"
                                                    onClick={() =>
                                                        onFiltersChange({
                                                            ...filters,
                                                            status: "all",
                                                        })
                                                    }
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        )}
                                        {filters.type !== "all" && (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-white/80 text-xs">
                                                {filters.type}
                                                <button
                                                    className="hover:text-white"
                                                    onClick={() =>
                                                        onFiltersChange({
                                                            ...filters,
                                                            type: "all",
                                                        })
                                                    }
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        )}
                                        {filters.hasReminders !== null && (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-white/80 text-xs">
                                                {filters.hasReminders
                                                    ? "With reminders"
                                                    : "No reminders"}
                                                <button
                                                    className="hover:text-white"
                                                    onClick={() =>
                                                        onFiltersChange({
                                                            ...filters,
                                                            hasReminders: null,
                                                        })
                                                    }
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        )}
                                        {localSearch && (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-white/80 text-xs">
                                                &quot;{localSearch}&quot;
                                                <button
                                                    className="hover:text-white"
                                                    onClick={clearSearch}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
