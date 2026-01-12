"use client";

import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { adminUsersParsers } from "../../search-params";
import { ClearFiltersButton } from "./clear-filters-button";
import { RoleFilter } from "./role-filter";
import { SearchInput } from "./search-input";

const roleSchema = z.union([
    z.literal("admin"),
    z.literal("user"),
    z.literal("all"),
]);

export function Filters() {
    const [search, setSearch] = useQueryState(
        "search",
        adminUsersParsers.search
    );
    const [role, setRole] = useQueryState("role", adminUsersParsers.role);

    const [inputValue, setInputValue] = useState(search || "");
    const debouncedValue = useDebounce(inputValue, 300);

    const isSearching = useMemo(
        () => inputValue !== debouncedValue,
        [inputValue, debouncedValue]
    );

    const hasActiveFilters = !!(search || (role && role !== "all"));

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

    const handleRoleChange = useCallback(
        (value: string) => {
            const parsedValue = roleSchema.safeParse(value);
            if (parsedValue.success) {
                setRole(parsedValue.data);
            }
        },
        [setRole]
    );

    const clearAllFilters = () => {
        setSearch(null);
        setRole(null);
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
                <RoleFilter onValueChange={handleRoleChange} value={role} />

                <ClearFiltersButton
                    onClick={clearAllFilters}
                    visible={hasActiveFilters}
                />
            </div>
        </div>
    );
}
