"use client";

import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiCalendarLine,
    RiFilterLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PAGES } from "@/constants/pages";
import { orpc } from "@/orpc/client";

interface DayPerformance {
    date: string;
    totalPnL: number;
    tradeCount: number;
    isPositive: boolean;
    isNeutral: boolean;
}

export default function TradingCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<"single" | "quarter" | "year">(
        "single"
    );
    const [selectedJournalIds, setSelectedJournalIds] = useState<string[]>([]);

    const { data: journals } = useQuery(
        orpc.trading.getJournals.queryOptions({ input: {} })
    );

    const { data: trades, isLoading } = useQuery(
        orpc.trading.getTrades.queryOptions({
            input: {
                journalIds: selectedJournalIds,
            },
        })
    );

    const dailyPerformance = useMemo(() => {
        if (!trades) {
            return new Map<string, DayPerformance>();
        }

        const performanceMap = new Map<string, DayPerformance>();

        for (const trade of trades) {
            if (!(trade.tradeDate && trade.isClosed)) {
                continue;
            }

            const tradeDate = new Date(trade.tradeDate)
                .toISOString()
                .split("T")[0];
            const pnlAmount = Number(trade.profitLossPercentage) || 0;

            const existing = performanceMap.get(tradeDate);
            if (existing) {
                existing.totalPnL += pnlAmount;
                existing.tradeCount += 1;
            } else {
                performanceMap.set(tradeDate, {
                    date: tradeDate,
                    totalPnL: pnlAmount,
                    tradeCount: 1,
                    isPositive: pnlAmount > 0,
                    isNeutral: pnlAmount === 0,
                });
            }
        }

        for (const day of performanceMap.values()) {
            day.isPositive = day.totalPnL > 0;
            day.isNeutral = day.totalPnL === 0;
        }

        return performanceMap;
    }, [trades]);

    const generateCalendarDays = (targetDate: Date) => {
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const current = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            const dateStr = current.toISOString().split("T")[0];
            const dayPerformance = dailyPerformance.get(dateStr);
            const isCurrentMonth = current.getMonth() === month;
            const isToday =
                current.toDateString() === new Date().toDateString();

            days.push({
                date: new Date(current),
                dateStr,
                dayPerformance,
                isCurrentMonth,
                isToday,
            });

            current.setDate(current.getDate() + 1);
        }

        return days;
    };

    const generateMultipleCalendars = () => {
        if (viewMode === "year") {
            const year = currentDate.getFullYear();
            const calendars = [];

            for (let month = 0; month < 12; month++) {
                const monthDate = new Date(year, month, 1);
                calendars.push({
                    month: monthDate,
                    days: generateCalendarDays(monthDate),
                });
            }

            return calendars;
        }
        if (viewMode === "quarter") {
            const year = currentDate.getFullYear();
            const quarterStart = Math.floor(currentDate.getMonth() / 3) * 3;
            const calendars = [];

            for (let month = quarterStart; month < quarterStart + 3; month++) {
                const monthDate = new Date(year, month, 1);
                calendars.push({
                    month: monthDate,
                    days: generateCalendarDays(monthDate),
                });
            }

            return calendars;
        }
        return [
            {
                month: currentDate,
                days: generateCalendarDays(currentDate),
            },
        ];
    };

    const calendars = generateMultipleCalendars();
    const monthNames = [
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

    const navigatePeriod = (direction: "prev" | "next") => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);

            if (viewMode === "single") {
                if (direction === "prev") {
                    newDate.setMonth(newDate.getMonth() - 1);
                } else {
                    newDate.setMonth(newDate.getMonth() + 1);
                }
            } else if (viewMode === "quarter") {
                if (direction === "prev") {
                    newDate.setMonth(newDate.getMonth() - 3);
                } else {
                    newDate.setMonth(newDate.getMonth() + 3);
                }
            } else if (viewMode === "year") {
                if (direction === "prev") {
                    newDate.setFullYear(newDate.getFullYear() - 1);
                } else {
                    newDate.setFullYear(newDate.getFullYear() + 1);
                }
            }

            return newDate;
        });
    };

    const getPeriodTitle = () => {
        if (viewMode === "single") {
            return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
        if (viewMode === "quarter") {
            const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
            return `Q${quarter} ${currentDate.getFullYear()}`;
        }
        if (viewMode === "year") {
            return `${currentDate.getFullYear()}`;
        }
        return "";
    };

    const getPeriodDescription = () => {
        if (viewMode === "single") {
            return "Single month view";
        }
        if (viewMode === "quarter") {
            return "Quarter view - 3 months";
        }
        if (viewMode === "year") {
            return "Year view - 12 months";
        }
        return "";
    };

    const handleJournalToggle = (journalId: string) => {
        setSelectedJournalIds((prev) =>
            prev.includes(journalId)
                ? prev.filter((id) => id !== journalId)
                : [...prev, journalId]
        );
    };

    const selectAllJournals = () => {
        if (journals) {
            setSelectedJournalIds(journals.map((j) => j.id));
        }
    };

    const clearJournalSelection = () => {
        setSelectedJournalIds([]);
    };

    const getDayClassName = (day: {
        isCurrentMonth: boolean;
        isToday: boolean;
        dayPerformance?: DayPerformance;
    }) => {
        let baseClasses =
            "w-12 h-12 flex flex-col items-center justify-center text-xs rounded-lg transition-colors relative font-semibold";

        if (!day.isCurrentMonth) {
            baseClasses += " text-white/30";
        } else if (day.isToday) {
            baseClasses +=
                " bg-white text-black font-bold ring-2 ring-white/50";
        } else if (day.dayPerformance) {
            if (day.dayPerformance.isPositive) {
                baseClasses +=
                    " bg-green-600 text-white hover:bg-green-500 shadow-lg";
            } else if (day.dayPerformance.isNeutral) {
                baseClasses += " bg-gray-600 text-white hover:bg-gray-500";
            } else {
                baseClasses +=
                    " bg-red-600 text-white hover:bg-red-500 shadow-lg";
            }
        } else {
            baseClasses += " text-white hover:bg-white/10";
        }

        return baseClasses;
    };

    const getDayContent = (day: { dayPerformance?: DayPerformance }) => {
        if (!day.dayPerformance) {
            return null;
        }

        const percentage =
            day.dayPerformance.totalPnL > 0
                ? `+${day.dayPerformance.totalPnL.toFixed(1)}%`
                : `${day.dayPerformance.totalPnL.toFixed(1)}%`;

        return (
            <div className="font-bold text-[9px] drop-shadow-xs">
                {percentage}
            </div>
        );
    };

    const getStats = () => {
        const performanceArray = Array.from(dailyPerformance.values());
        const positiveDays = performanceArray.filter(
            (day) => day.isPositive
        ).length;
        const negativeDays = performanceArray.filter(
            (day) => !(day.isPositive || day.isNeutral)
        ).length;
        const neutralDays = performanceArray.filter(
            (day) => day.isNeutral
        ).length;
        const totalDays = performanceArray.length;

        return { positiveDays, negativeDays, neutralDays, totalDays };
    };

    const stats = getStats();

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="mb-6 h-8 w-1/4 rounded bg-gray-200" />
                    <div className="mb-4 grid grid-cols-7 gap-2">
                        {new Array(35).map((_, i) => (
                            <div className="h-10 rounded bg-gray-200" key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost">
                        <Link href={PAGES.TRADING_JOURNALS}>
                            <RiArrowLeftSLine className="mr-2 size-4" />
                            Back to Journals
                        </Link>
                    </Button>
                    <div className="group relative">
                        <Button variant="outline">
                            <RiFilterLine className="mr-2 size-4" />
                            Journals filter
                            {selectedJournalIds.length > 0 && (
                                <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
                            )}
                        </Button>

                        {journals && journals.length > 0 && (
                            <div className="pointer-events-none absolute top-full right-0 z-50 mt-2 w-64 rounded-lg border border-white/10 bg-black opacity-0 shadow-lg transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                                <div className="p-3">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="font-medium text-sm text-white">
                                            Filter Journals
                                        </h3>
                                        <div className="flex space-x-1">
                                            <Button
                                                className="h-6 px-2 text-white/60 text-xs hover:bg-white/10 hover:text-white"
                                                onClick={selectAllJournals}
                                                size="sm"
                                                variant="ghost"
                                            >
                                                All
                                            </Button>
                                            <Button
                                                className="h-6 px-2 text-white/60 text-xs hover:bg-white/10 hover:text-white"
                                                onClick={clearJournalSelection}
                                                size="sm"
                                                variant="ghost"
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="max-h-48 space-y-2 overflow-y-auto">
                                        {journals.map((journal) => (
                                            <div
                                                className="flex cursor-pointer items-center space-x-2 rounded p-1 transition-colors hover:bg-white/5"
                                                key={journal.id}
                                                onClick={() =>
                                                    handleJournalToggle(
                                                        journal.id
                                                    )
                                                }
                                            >
                                                <Checkbox
                                                    checked={selectedJournalIds.includes(
                                                        journal.id
                                                    )}
                                                    className="border-white/20"
                                                    onChange={() =>
                                                        handleJournalToggle(
                                                            journal.id
                                                        )
                                                    }
                                                />
                                                <span className="truncate font-medium text-white text-xs">
                                                    {journal.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedJournalIds.length > 0 && (
                                        <div className="mt-2 border-white/10 border-t pt-2">
                                            <p className="text-white/60 text-xs">
                                                {selectedJournalIds.length}{" "}
                                                journal
                                                {selectedJournalIds.length > 1
                                                    ? "s"
                                                    : ""}{" "}
                                                selected
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="-top-2 pointer-events-auto absolute right-0 left-0 h-2" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Card className="mb-6 border border-white/10 bg-black/20">
                <CardHeader>
                    <CardTitle className="text-white">View Mode</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { key: "single", label: "Single Month" },
                            { key: "quarter", label: "Quarter View" },
                            { key: "year", label: "Year View" },
                        ].map((mode) => (
                            <Button
                                className={`flex h-10 items-center justify-center text-sm ${
                                    viewMode === mode.key
                                        ? "bg-white text-black hover:bg-gray-200"
                                        : "border-white/20 bg-transparent text-white hover:bg-white/10"
                                }`}
                                key={mode.key}
                                onClick={() =>
                                    setViewMode(
                                        mode.key as
                                            | "single"
                                            | "quarter"
                                            | "year"
                                    )
                                }
                                variant={
                                    viewMode === mode.key
                                        ? "primary"
                                        : "outline"
                                }
                            >
                                <span className="font-medium">
                                    {mode.label}
                                </span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <section className="mb-10">
                <h2 className="mb-6 font-medium text-gray-300 text-lg tracking-tight">
                    All Time Stats
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border border-white/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="font-medium text-gray-300 text-sm">
                                Positive Days
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-2xl text-white">
                                {stats.positiveDays}
                            </div>
                            <p className="mt-1 text-gray-400 text-xs">
                                {stats.totalDays > 0
                                    ? Math.round(
                                          (stats.positiveDays /
                                              stats.totalDays) *
                                              100
                                      )
                                    : 0}
                                % of total
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-white/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="font-medium text-gray-300 text-sm">
                                Negative Days
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-2xl text-white">
                                {stats.negativeDays}
                            </div>
                            <p className="mt-1 text-gray-400 text-xs">
                                {stats.totalDays > 0
                                    ? Math.round(
                                          (stats.negativeDays /
                                              stats.totalDays) *
                                              100
                                      )
                                    : 0}
                                % of total
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-white/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="font-medium text-gray-300 text-sm">
                                Neutral Days
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-2xl text-white">
                                {stats.neutralDays}
                            </div>
                            <p className="mt-1 text-gray-400 text-xs">
                                {stats.totalDays > 0
                                    ? Math.round(
                                          (stats.neutralDays /
                                              stats.totalDays) *
                                              100
                                      )
                                    : 0}
                                % of total
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-white/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="font-medium text-gray-300 text-sm">
                                Total Days
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-2xl text-white">
                                {stats.totalDays}
                            </div>
                            <p className="mt-1 text-gray-400 text-xs">
                                with trades
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>
            {selectedJournalIds.length > 0 && (
                <div className="mt-6 mb-6 text-center text-sm text-white/70">
                    <div className="inline-flex items-center justify-center gap-4">
                        <span>
                            <span className="mr-1 inline-block h-3 w-3 rounded-full bg-green-400 align-middle opacity-75" />
                            <span className="align-middle">Green</span>:
                            Positive day
                        </span>
                        <span>
                            <span className="mr-1 inline-block h-3 w-3 rounded-full bg-gray-400 align-middle" />
                            <span className="align-middle">Gray</span>: Neutral
                            day
                        </span>
                        <span>
                            <span className="mr-1 inline-block h-3 w-3 rounded-full bg-red-400 align-middle opacity-75" />
                            <span className="align-middle">Red</span>: Negative
                            day
                        </span>
                    </div>
                </div>
            )}
            {selectedJournalIds.length > 0 && viewMode === "single" ? (
                calendars.map((calendar, calendarIndex) => (
                    <Card
                        className="mb-6 border border-white/10 bg-black/20"
                        key={calendarIndex}
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-white">
                                        {getPeriodTitle()}
                                    </CardTitle>
                                    <CardDescription className="text-white/60">
                                        {getPeriodDescription()}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        className="border-white/20 bg-transparent text-white hover:bg-white/10"
                                        onClick={() => navigatePeriod("prev")}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <RiArrowLeftSLine className="size-4" />
                                    </Button>
                                    <Button
                                        className="border-white/20 bg-transparent text-white hover:bg-white/10"
                                        onClick={() =>
                                            setCurrentDate(new Date())
                                        }
                                        size="sm"
                                        variant="outline"
                                    >
                                        Today
                                    </Button>
                                    <Button
                                        className="border-white/20 bg-transparent text-white hover:bg-white/10"
                                        onClick={() => navigatePeriod("next")}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <RiArrowRightSLine className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-7 gap-2">
                                {[
                                    "Sun",
                                    "Mon",
                                    "Tue",
                                    "Wed",
                                    "Thu",
                                    "Fri",
                                    "Sat",
                                ].map((day) => (
                                    <div
                                        className="py-2 text-center font-medium text-sm text-white/60"
                                        key={day}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {calendar.days.map((day, index) => (
                                    <div
                                        className={`${getDayClassName(day)} group`}
                                        key={index}
                                        title={
                                            day.dayPerformance
                                                ? `${day.date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" })} - PnL: ${day.dayPerformance.totalPnL.toFixed(2)}%, Trades: ${day.dayPerformance.tradeCount}`
                                                : `${day.date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" })} - No trades`
                                        }
                                    >
                                        <div className="flex h-full flex-col items-center justify-center">
                                            <span className="font-medium text-xs">
                                                {day.date.getDate()}
                                            </span>
                                            {getDayContent(day)}
                                        </div>

                                        {day.dayPerformance && (
                                            <div className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 transform whitespace-nowrap rounded-lg bg-black px-3 py-2 text-white text-xs opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                                <div className="font-semibold">
                                                    {day.date.toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            weekday: "long",
                                                            day: "2-digit",
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </div>
                                                <div className="text-green-400">
                                                    PnL:{" "}
                                                    {day.dayPerformance
                                                        .totalPnL > 0
                                                        ? "+"
                                                        : ""}
                                                    {day.dayPerformance.totalPnL.toFixed(
                                                        2
                                                    )}
                                                    %
                                                </div>
                                                <div className="text-gray-300">
                                                    Trades:{" "}
                                                    {
                                                        day.dayPerformance
                                                            .tradeCount
                                                    }
                                                </div>
                                                <div className="-translate-x-1/2 absolute top-full left-1/2 h-0 w-0 transform border-transparent border-t-4 border-t-black border-r-4 border-l-4" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : selectedJournalIds.length > 0 ? (
                <Card className="border border-white/10 bg-black/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white">
                                    {getPeriodTitle()}
                                </CardTitle>
                                <CardDescription className="text-white/60">
                                    {getPeriodDescription()}
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                                    onClick={() => navigatePeriod("prev")}
                                    size="sm"
                                    variant="outline"
                                >
                                    <RiArrowLeftSLine className="size-4" />
                                </Button>
                                <Button
                                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                                    onClick={() => setCurrentDate(new Date())}
                                    size="sm"
                                    variant="outline"
                                >
                                    Today
                                </Button>
                                <Button
                                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                                    onClick={() => navigatePeriod("next")}
                                    size="sm"
                                    variant="outline"
                                >
                                    <RiArrowRightSLine className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`grid gap-4 ${viewMode === "year" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
                        >
                            {calendars.map((calendar, calendarIndex) => (
                                <div
                                    className="rounded-lg bg-black/10 p-3"
                                    key={calendarIndex}
                                >
                                    <div className="mb-3 text-center">
                                        <h3 className="font-semibold text-sm text-white">
                                            {
                                                monthNames[
                                                    calendar.month.getMonth()
                                                ]
                                            }
                                        </h3>
                                    </div>

                                    <div className="mb-2 grid grid-cols-7 gap-1">
                                        {[
                                            "S",
                                            "M",
                                            "T",
                                            "W",
                                            "T",
                                            "F",
                                            "S",
                                        ].map((day) => (
                                            <div
                                                className="py-1 text-center font-medium text-white/60 text-xs"
                                                key={day}
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {calendar.days.map((day, index) => (
                                            <div
                                                className={`group relative flex h-8 w-8 flex-col items-center justify-center rounded font-semibold text-xs transition-colors ${
                                                    day.isCurrentMonth
                                                        ? day.isToday
                                                            ? "bg-white font-bold text-black"
                                                            : day.dayPerformance
                                                              ? day
                                                                    .dayPerformance
                                                                    .isPositive
                                                                  ? "bg-green-600 text-white opacity-75"
                                                                  : day
                                                                          .dayPerformance
                                                                          .isNeutral
                                                                    ? "bg-gray-600 text-white"
                                                                    : "bg-red-600 text-white opacity-75"
                                                              : "text-white hover:bg-white/10"
                                                        : "text-white/30"
                                                }`}
                                                key={index}
                                                title={
                                                    day.dayPerformance
                                                        ? `${day.date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" })} - PnL: ${day.dayPerformance.totalPnL.toFixed(2)}%, Trades: ${day.dayPerformance.tradeCount}`
                                                        : `${day.date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" })} - No trades`
                                                }
                                            >
                                                <span className="font-medium text-[9px]">
                                                    {day.date.getDate()}
                                                </span>
                                                {day.dayPerformance && (
                                                    <div className="font-bold text-[7px]">
                                                        {day.dayPerformance
                                                            .totalPnL > 0
                                                            ? `+${day.dayPerformance.totalPnL.toFixed(0)}%`
                                                            : `${day.dayPerformance.totalPnL.toFixed(0)}%`}
                                                    </div>
                                                )}

                                                {day.dayPerformance && (
                                                    <div className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 transform whitespace-nowrap rounded-lg bg-black px-3 py-2 text-white text-xs opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                                        <div className="font-semibold">
                                                            {day.date.toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    weekday:
                                                                        "long",
                                                                    day: "2-digit",
                                                                    month: "long",
                                                                    year: "numeric",
                                                                }
                                                            )}
                                                        </div>
                                                        <div className="text-green-400">
                                                            PnL:{" "}
                                                            {day.dayPerformance
                                                                .totalPnL > 0
                                                                ? "+"
                                                                : ""}
                                                            {day.dayPerformance.totalPnL.toFixed(
                                                                2
                                                            )}
                                                            %
                                                        </div>
                                                        <div className="text-gray-300">
                                                            Trades:{" "}
                                                            {
                                                                day
                                                                    .dayPerformance
                                                                    .tradeCount
                                                            }
                                                        </div>
                                                        <div className="-translate-x-1/2 absolute top-full left-1/2 h-0 w-0 transform border-transparent border-t-4 border-t-black border-r-4 border-l-4" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="mb-6 py-8 text-center">
                    <div className="inline-flex items-center space-x-2 text-white/40">
                        <RiCalendarLine className="size-5" />
                        <span className="text-sm">No journals selected</span>
                    </div>
                    <p className="mt-2 text-white/30 text-xs">
                        Use the filter above to select journals and view your
                        performance
                    </p>
                </div>
            )}
        </div>
    );
}
