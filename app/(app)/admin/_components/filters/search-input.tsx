"use client";

import { RiSearchLine, RiCloseLine } from "@remixicon/react";
import type * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
    className?: string;
    isSearching?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    placeholder?: string;
    value: string;
}

export function SearchInput({
    className,
    isSearching = false,
    onChange,
    onClear,
    placeholder = "Search...",
    value,
}: SearchInputProps) {
    return (
        <div className={cn("relative", className)}>
            <RiSearchLine className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
                className={cn("pl-9", (value || isSearching) && "pr-9")}
                onChange={onChange}
                placeholder={placeholder}
                type="text"
                value={value}
            />
            {isSearching ? (
                <div className="-translate-y-1/2 absolute top-1/2 right-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                </div>
            ) : (
                value && (
                    <button
                        className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
                        onClick={onClear}
                        type="button"
                    >
                        <RiCloseLine className="h-4 w-4" />
                    </button>
                )
            )}
        </div>
    );
}
