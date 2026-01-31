"use client";

import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ClearFiltersButton } from "@/app/(app)/admin/_components/filters/clear-filters-button";
import { SearchInput } from "@/app/(app)/admin/_components/filters/search-input";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { adminWaitlistParsers } from "../search-params";

export function Filters() {
    const [search, setSearch] = useQueryState(
        "search",
        adminWaitlistParsers.search
    );

    const [inputValue, setInputValue] = useState(search || "");
    const debouncedValue = useDebounce(inputValue, 300);

    const isSearching = useMemo(
        () => inputValue !== debouncedValue,
        [inputValue, debouncedValue]
    );

    const hasActiveFilters = !!search;

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

    const clearAllFilters = () => {
        setSearch(null);
        setInputValue("");
    };

    return (
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
            <SearchInput
                className="lg:hidden"
                isSearching={isSearching}
                onChange={handleInputChange}
                onClear={clearSearch}
                placeholder="Rechercher..."
                value={inputValue}
            />

            <div className="hidden flex-wrap gap-3 lg:flex min-[560px]:flex-nowrap">
                <SearchInput
                    className="w-[300px]"
                    isSearching={isSearching}
                    onChange={handleInputChange}
                    onClear={clearSearch}
                    placeholder="Rechercher..."
                    value={inputValue}
                />
            </div>

            <div className="flex flex-wrap gap-3">
                <ClearFiltersButton
                    onClick={clearAllFilters}
                    visible={hasActiveFilters}
                />
            </div>
        </div>
    );
}
