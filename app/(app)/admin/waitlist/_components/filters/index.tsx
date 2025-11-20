"use client";

import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { adminWaitlistParsers } from "../../search-params";
import { ClearFiltersButton } from "./clear-filters-button";
import { SearchInput } from "./search-input";
import { StatusFilter } from "./status-filter";

const waitlistStatusSchema = z.union([
    z.literal("approved"),
    z.literal("pending"),
    z.literal("rejected"),
    z.literal("all"),
]);

export function Filters() {
    const [search, setSearch] = useQueryState(
        "search",
        adminWaitlistParsers.search
    );
    const [waitlistStatus, setWaitlistStatus] = useQueryState(
        "waitlistStatus",
        adminWaitlistParsers.waitlistStatus
    );

    const [inputValue, setInputValue] = useState(search || "");
    const debouncedValue = useDebounce(inputValue, 300);

    const isSearching = useMemo(
        () => inputValue !== debouncedValue,
        [inputValue, debouncedValue]
    );

    const hasActiveFilters = !!(
        search ||
        (waitlistStatus && waitlistStatus !== "all")
    );

    useEffect(() => {
        if (debouncedValue !== search) {
            setSearch(debouncedValue || null);
        }
    }, [debouncedValue, search, setSearch]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value);
        },
        []
    );

    const clearSearch = useCallback(() => {
        setSearch(null);
        setInputValue("");
    }, [setSearch]);

    const handleWaitlistStatusChange = useCallback(
        (value: string) => {
            const parsedValue = waitlistStatusSchema.safeParse(value);
            if (parsedValue.success) {
                setWaitlistStatus(parsedValue.data);
            }
        },
        [setWaitlistStatus]
    );

    const clearAllFilters = () => {
        setSearch(null);
        setWaitlistStatus(null);
        setInputValue("");
    };

    return (
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
            <SearchInput
                className="lg:hidden"
                isSearching={isSearching}
                onChange={handleInputChange}
                onClear={clearSearch}
                placeholder="Search..."
                value={inputValue}
            />

            <div className="hidden flex-wrap gap-3 lg:flex min-[560px]:flex-nowrap">
                <SearchInput
                    className="w-[300px]"
                    isSearching={isSearching}
                    onChange={handleInputChange}
                    onClear={clearSearch}
                    placeholder="Search..."
                    value={inputValue}
                />
            </div>

            <div className="flex flex-wrap gap-3">
                <StatusFilter
                    onValueChange={handleWaitlistStatusChange}
                    value={waitlistStatus}
                />

                <ClearFiltersButton
                    onClick={clearAllFilters}
                    visible={hasActiveFilters}
                />
            </div>
        </div>
    );
}

