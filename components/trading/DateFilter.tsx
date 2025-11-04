"use client";

import { Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface DateFilterState {
    view: "monthly" | "yearly" | "all";
    month?: string;
    year?: string;
}

interface DateFilterProps {
    onFilterChange: (filter: DateFilterState) => void;
    className?: string;
}

export function DateFilter({
    onFilterChange,
    className = "",
}: DateFilterProps) {
    const [filter, setFilter] = useState<DateFilterState>({
        view: "all",
    });

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) =>
        (currentYear - 5 + i).toString()
    );

    const handleViewChange = (view: "monthly" | "yearly" | "all") => {
        let newFilter = { ...filter, view };

        if (view === "monthly" && !newFilter.month) {
            const currentMonthIndex = new Date().getMonth();
            newFilter = { ...newFilter, month: months[currentMonthIndex] };
        }
        if ((view === "monthly" || view === "yearly") && !newFilter.year) {
            newFilter = {
                ...newFilter,
                year: new Date().getFullYear().toString(),
            };
        }

        setFilter(newFilter);
        onFilterChange(newFilter);
    };

    const handleMonthChange = (month: string) => {
        const newFilter = { ...filter, month };
        setFilter(newFilter);
        onFilterChange(newFilter);
    };

    const handleYearChange = (year: string) => {
        const newFilter = { ...filter, year };
        setFilter(newFilter);
        onFilterChange(newFilter);
    };

    return (
        <div
            className={`flex flex-col items-start gap-3 sm:flex-row sm:items-center ${className}`}
        >
            {/* Filter Label */}
            <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-white/60" />
                <span className="font-medium text-sm text-white/70">
                    Period:
                </span>
            </div>

            {/* Date Selectors */}
            <div className="flex items-center gap-2">
                {filter.view === "monthly" && (
                    <Select
                        onValueChange={handleMonthChange}
                        value={filter.month}
                    >
                        <SelectTrigger className="h-8 w-28 rounded-md border-white/15 bg-black/40 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/20 bg-black/90">
                            {months.map((month) => (
                                <SelectItem
                                    className="text-white hover:bg-white/10"
                                    key={month}
                                    value={month}
                                >
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {(filter.view === "monthly" || filter.view === "yearly") && (
                    <Select
                        onValueChange={handleYearChange}
                        value={filter.year}
                    >
                        <SelectTrigger className="h-8 w-16 rounded-md border-white/15 bg-black/40 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/20 bg-black/90">
                            {years.map((year) => (
                                <SelectItem
                                    className="text-white hover:bg-white/10"
                                    key={year}
                                    value={year}
                                >
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* View Toggle Buttons */}
            <div className="flex rounded-lg border border-white/10 bg-black/30 p-1">
                <Button
                    className={`h-7 rounded-md px-3 text-xs transition-all ${
                        filter.view === "monthly"
                            ? "bg-white/20 text-white shadow-xs"
                            : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => handleViewChange("monthly")}
                    size="sm"
                    variant="ghost"
                >
                    Monthly
                </Button>
                <Button
                    className={`h-7 rounded-md px-3 text-xs transition-all ${
                        filter.view === "yearly"
                            ? "bg-white/20 text-white shadow-xs"
                            : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => handleViewChange("yearly")}
                    size="sm"
                    variant="ghost"
                >
                    Yearly
                </Button>
                <Button
                    className={`h-7 rounded-md px-3 text-xs transition-all ${
                        filter.view === "all"
                            ? "bg-white/20 text-white shadow-xs"
                            : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => handleViewChange("all")}
                    size="sm"
                    variant="ghost"
                >
                    All
                </Button>
            </div>
        </div>
    );
}
