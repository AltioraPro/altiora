"use client";

import { RiCalendarLine } from "@remixicon/react";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { memo, useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRangeFilterState {
    from: Date | undefined;
    to: Date | undefined;
}

interface DateRangeFilterProps {
    value: DateRangeFilterState;
    onChange: (range: DateRangeFilterState) => void;
    className?: string;
}

type PresetKey =
    | "today"
    | "last7days"
    | "last30days"
    | "thisMonth"
    | "lastMonth"
    | "last3Months"
    | "thisYear"
    | "all";

interface Preset {
    label: string;
    getRange: () => DateRangeFilterState;
}

const PRESET_KEYS: PresetKey[] = [
    "today",
    "last7days",
    "last30days",
    "thisMonth",
    "lastMonth",
    "last3Months",
    "thisYear",
    "all",
];

const PRESETS: Record<PresetKey, Preset> = {
    today: {
        label: "Today",
        getRange: () => {
            const today = new Date();
            return { from: today, to: today };
        },
    },
    last7days: {
        label: "Last 7 days",
        getRange: () => {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 6);
            return { from: weekAgo, to: today };
        },
    },
    last30days: {
        label: "Last 30 days",
        getRange: () => {
            const today = new Date();
            const monthAgo = new Date(today);
            monthAgo.setDate(today.getDate() - 29);
            return { from: monthAgo, to: today };
        },
    },
    thisMonth: {
        label: "This month",
        getRange: () => {
            const today = new Date();
            return { from: startOfMonth(today), to: endOfMonth(today) };
        },
    },
    lastMonth: {
        label: "Last month",
        getRange: () => {
            const lastMonth = subMonths(new Date(), 1);
            return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        },
    },
    last3Months: {
        label: "Last 3 months",
        getRange: () => {
            const today = new Date();
            const threeMonthsAgo = subMonths(today, 2);
            return { from: startOfMonth(threeMonthsAgo), to: today };
        },
    },
    thisYear: {
        label: "This year",
        getRange: () => {
            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            return { from: startOfYear, to: today };
        },
    },
    all: {
        label: "All time",
        getRange: () => ({ from: undefined, to: undefined }),
    },
};

function DateRangeFilterComponent({
    value,
    onChange,
    className = "",
}: DateRangeFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [internalRange, setInternalRange] = useState<DateRange | undefined>(
        value.from || value.to ? { from: value.from, to: value.to } : undefined
    );

    // Sync internal state with props
    useEffect(() => {
        setInternalRange(
            value.from || value.to
                ? { from: value.from, to: value.to }
                : undefined
        );
    }, [value.from, value.to]);

    const handleRangeSelect = useCallback((range: DateRange | undefined) => {
        setInternalRange(range);
    }, []);

    const handleApply = useCallback(() => {
        onChange({ from: internalRange?.from, to: internalRange?.to });
        setIsOpen(false);
    }, [internalRange, onChange]);

    const handlePresetClick = useCallback(
        (presetKey: PresetKey) => {
            const range = PRESETS[presetKey].getRange();
            onChange(range);
            setIsOpen(false);
        },
        [onChange]
    );

    const handleCancel = useCallback(() => {
        // Reset internal range to match current value
        setInternalRange(
            value.from || value.to
                ? { from: value.from, to: value.to }
                : undefined
        );
        setIsOpen(false);
    }, [value.from, value.to]);

    // Format display text
    const displayText = (() => {
        if (!(value.from || value.to)) {
            return "All time";
        }
        if (value.from && value.to) {
            if (value.from.getTime() === value.to.getTime()) {
                return format(value.from, "MMM d, yyyy");
            }
            return `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`;
        }
        if (value.from) {
            return `From ${format(value.from, "MMM d, yyyy")}`;
        }
        if (value.to) {
            return `Until ${format(value.to, "MMM d, yyyy")}`;
        }
        return "All time";
    })();

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Popover onOpenChange={setIsOpen} open={isOpen}>
                <PopoverTrigger asChild>
                    <Button
                        aria-expanded={isOpen}
                        type="button"
                        variant="outline"
                    >
                        <RiCalendarLine className="size-4" />
                        {displayText}
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    className="w-auto p-0 shadow-2xl"
                    sideOffset={8}
                >
                    <div className="flex">
                        {/* Presets sidebar */}
                        <div className="flex w-36 flex-col border-neutral-800 border-r px-2 pt-4">
                            <p className="mb-2 px-2 text-neutral-400 text-xs">
                                Quick select
                            </p>
                            {PRESET_KEYS.map((key) => (
                                <Button
                                    className="justify-start px-2 text-neutral-400 text-xs hover:bg-neutral-800 hover:text-white"
                                    key={key}
                                    onClick={() => handlePresetClick(key)}
                                    size="sm"
                                    type="button"
                                    variant="ghost"
                                >
                                    {PRESETS[key].label}
                                </Button>
                            ))}
                        </div>

                        {/* Calendar */}
                        <div className="w-auto p-3">
                            <Calendar
                                className="relative rounded-md border-0 bg-transparent text-white"
                                classNames={{
                                    range_start: "bg-accent rounded-none",
                                    range_end: "bg-accent rounded-none",
                                    range_middle: "rounded-none",
                                    today: "bg-transparent rounded-none",
                                }}
                                components={{
                                    // biome-ignore lint/correctness/noNestedComponentDefinitions: shadcn-ui
                                    DayButton: (props) => (
                                        <CalendarDayButton
                                            {...props}
                                            className={cn(
                                                "data-[selected-single=true]:rounded-none!",
                                                "data-[range-start=true]:rounded-none!",
                                                "data-[range-end=true]:rounded-none!",
                                                "data-[range-middle=true]:rounded-none!",
                                                "[&:hover]:rounded-none!",
                                                props.className
                                            )}
                                        />
                                    ),
                                }}
                                defaultMonth={value.from ?? new Date()}
                                mode="range"
                                numberOfMonths={2}
                                onSelect={handleRangeSelect}
                                selected={internalRange}
                            />

                            {/* Footer */}
                            <div className="mt-3 flex items-center justify-between border-white/10 border-t pt-3">
                                <div className="text-white/50 text-xs">
                                    {internalRange?.from && (
                                        <span>
                                            {format(
                                                internalRange.from,
                                                "MMM d, yyyy"
                                            )}
                                            {internalRange.to &&
                                            internalRange.to.getTime() !==
                                                internalRange.from.getTime()
                                                ? ` → ${format(internalRange.to, "MMM d, yyyy")}`
                                                : ""}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleCancel}
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleApply}
                                        size="sm"
                                        type="button"
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export const DateRangeFilter = memo(DateRangeFilterComponent);
