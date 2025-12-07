"use client";

import { RiCalendarLine, RiCloseLine } from "@remixicon/react";
import { format } from "date-fns";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function DatePickerDemo() {
    const [date, setDate] = React.useState<Date>();

    const handleReset = (e: React.MouseEvent<HTMLElement>) => {
        setDate(undefined);
        e.preventDefault();
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative w-[250px]">
                    <Button
                        className="w-full"
                        mode="input"
                        placeholder={!date}
                        type="button"
                        variant="outline"
                    >
                        <RiCalendarLine />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    {date && (
                        <Button
                            className="-translate-y-1/2 absolute end-0 top-1/2"
                            onClick={handleReset}
                            size="sm"
                            type="button"
                            variant="dim"
                        >
                            <RiCloseLine />
                        </Button>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                    autoFocus
                    mode="single"
                    onSelect={setDate}
                    selected={date}
                />
            </PopoverContent>
        </Popover>
    );
}
