"use client";

import { useQueryState } from "nuqs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { leaderboardSearchParams } from "../search-params";

type Period = "all" | "week" | "month" | "year";

export function LeaderboardPeriodFilter() {
    const [period, setPeriod] = useQueryState(
        "period",
        leaderboardSearchParams.period
    );

    return (
        <Select
            onValueChange={(value) => setPeriod(value as Period)}
            value={period}
        >
            <SelectTrigger className="flex w-fit items-center gap-2.5">
                <SelectValue defaultValue={period} />
            </SelectTrigger>
            <SelectContent align="end">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
        </Select>
    );
}
