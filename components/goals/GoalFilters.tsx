"use client";

import {
    RiCloseLine,
    RiFilterLine,
    RiSearchLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { orpc } from "@/orpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface GoalFiltersProps {
    search: string;
    onSearchChange: (search: string) => void;
    filters: {
        status: "all" | "active" | "completed";
        type: "all" | "annual" | "quarterly" | "monthly";
        hasReminders: boolean | null;
        categoryIds: string[];
    };
    onFiltersChange: (filters: {
        status: "all" | "active" | "completed";
        type: "all" | "annual" | "quarterly" | "monthly";
        hasReminders: boolean | null;
        categoryIds: string[];
    }) => void;
}

export function GoalFilters({
    search,
    onSearchChange,
    filters,
    onFiltersChange,
}: GoalFiltersProps): React.JSX.Element {
    const [localSearch, setLocalSearch] = useState(search);

    const { data: categories } = useQuery(
        orpc.categories.getAll.queryOptions({ input: undefined })
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(localSearch);
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearch, onSearchChange]);

    const clearSearch = (): void => {
        setLocalSearch("");
        onSearchChange("");
    };

    const clearAllFilters = (): void => {
        onFiltersChange({
            status: "all",
            type: "all",
            hasReminders: null,
            categoryIds: [],
        });
        setLocalSearch("");
        onSearchChange("");
    };

    const hasActiveFilters =
        filters.status !== "all" ||
        filters.type !== "all" ||
        filters.hasReminders !== null ||
        filters.categoryIds.length > 0 ||
        localSearch;

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 sm:max-w-sm">
                <RiSearchLine className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-9 bg-secondary/50 border-0 h-9 text-sm sm:text-base"
                    placeholder="Search goals..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                />
                {localSearch && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <RiCloseLine className="size-4" />
                    </button>
                )}
            </div>

            {/* Filters Popover */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "h-9 border-dashed",
                            hasActiveFilters && "border-solid bg-secondary/50 border-secondary-foreground/20"
                        )}
                    >
                        <RiFilterLine className="mr-2 size-4" />
                        Filters
                        {hasActiveFilters && (
                            <div className="ml-2 size-1.5 rounded-full bg-primary" />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-5">
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium leading-none">Filters</h4>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {/* Type Filter */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Type</Label>
                                <Select
                                    value={filters.type}
                                    onValueChange={(val: "all" | "annual" | "quarterly" | "monthly") =>
                                        onFiltersChange({ ...filters, type: val })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="annual">Annual</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Status</Label>
                                <Select
                                    value={filters.status}
                                    onValueChange={(val: "all" | "active" | "completed") =>
                                        onFiltersChange({ ...filters, status: val })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Reminders Filter */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Reminders</Label>
                                <Select
                                    value={filters.hasReminders === null ? "all" : filters.hasReminders.toString()}
                                    onValueChange={(val) =>
                                        onFiltersChange({
                                            ...filters,
                                            hasReminders: val === "all" ? null : val === "true",
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by reminders" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">Has Reminders</SelectItem>
                                        <SelectItem value="false">No Reminders</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Categories Filter */}
                            {categories && categories.length > 0 && (
                                <div className="space-y-2 pt-2 border-t">
                                    <Label className="text-xs text-muted-foreground">Categories</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {categories.map((cat) => {
                                            const isSelected = filters.categoryIds.includes(cat.id);
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const newIds = isSelected
                                                            ? filters.categoryIds.filter((id) => id !== cat.id)
                                                            : [...filters.categoryIds, cat.id];
                                                        onFiltersChange({ ...filters, categoryIds: newIds });
                                                    }}
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                                                        isSelected
                                                            ? "bg-secondary border-transparent text-secondary-foreground"
                                                            : "border-transparent bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                                    )}
                                                >
                                                    <div
                                                        className="size-1.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: cat.color }}
                                                    />
                                                    {cat.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
