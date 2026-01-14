"use client";

import { RiCloseLine, RiFilterLine, RiSearchLine } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { orpc } from "@/orpc/client";

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
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 sm:max-w-sm">
                <RiSearchLine className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
                <Input
                    className="h-9 border-0 bg-secondary/50 pl-9 text-sm sm:text-base"
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search goals..."
                    value={localSearch}
                />
                {localSearch && (
                    <button
                        className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
                        onClick={clearSearch}
                        type="button"
                    >
                        <RiCloseLine className="size-4" />
                    </button>
                )}
            </div>

            {/* Filters Popover */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        className={cn(
                            "h-9 border-dashed",
                            hasActiveFilters &&
                                "border-secondary-foreground/20 border-solid bg-secondary/50"
                        )}
                        size="sm"
                        variant="outline"
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
                            <h4 className="font-medium leading-none">
                                Filters
                            </h4>
                            {hasActiveFilters && (
                                <button
                                    className="text-muted-foreground text-xs transition-colors hover:text-foreground"
                                    onClick={clearAllFilters}
                                    type="button"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {/* Type Filter */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs">
                                    Type
                                </Label>
                                <Select
                                    onValueChange={(
                                        val:
                                            | "all"
                                            | "annual"
                                            | "quarterly"
                                            | "monthly"
                                    ) =>
                                        onFiltersChange({
                                            ...filters,
                                            type: val,
                                        })
                                    }
                                    value={filters.type}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Types
                                        </SelectItem>
                                        <SelectItem value="annual">
                                            Annual
                                        </SelectItem>
                                        <SelectItem value="quarterly">
                                            Quarterly
                                        </SelectItem>
                                        <SelectItem value="monthly">
                                            Monthly
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs">
                                    Status
                                </Label>
                                <Select
                                    onValueChange={(
                                        val: "all" | "active" | "completed"
                                    ) =>
                                        onFiltersChange({
                                            ...filters,
                                            status: val,
                                        })
                                    }
                                    value={filters.status}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Statuses
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Completed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Reminders Filter */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs">
                                    Reminders
                                </Label>
                                <Select
                                    onValueChange={(val) =>
                                        onFiltersChange({
                                            ...filters,
                                            hasReminders:
                                                val === "all"
                                                    ? null
                                                    : val === "true",
                                        })
                                    }
                                    value={
                                        filters.hasReminders === null
                                            ? "all"
                                            : filters.hasReminders.toString()
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by reminders" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">
                                            Has Reminders
                                        </SelectItem>
                                        <SelectItem value="false">
                                            No Reminders
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Categories Filter */}
                            {categories && categories.length > 0 && (
                                <div className="space-y-2 border-t pt-2">
                                    <Label className="text-muted-foreground text-xs">
                                        Categories
                                    </Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {categories.map((cat) => {
                                            const isSelected =
                                                filters.categoryIds.includes(
                                                    cat.id
                                                );
                                            return (
                                                <button
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                                                        isSelected
                                                            ? "border-transparent bg-secondary text-secondary-foreground"
                                                            : "border-transparent bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                                    )}
                                                    key={cat.id}
                                                    onClick={() => {
                                                        const newIds =
                                                            isSelected
                                                                ? filters.categoryIds.filter(
                                                                      (id) =>
                                                                          id !==
                                                                          cat.id
                                                                  )
                                                                : [
                                                                      ...filters.categoryIds,
                                                                      cat.id,
                                                                  ];
                                                        onFiltersChange({
                                                            ...filters,
                                                            categoryIds: newIds,
                                                        });
                                                    }}
                                                    type="button"
                                                >
                                                    <div
                                                        className="size-1.5 shrink-0 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                cat.color,
                                                        }}
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
