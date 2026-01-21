"use client";

import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiInformationLine,
} from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DayPerformance {
    date: string;
    totalPnL: number;
    tradeCount: number;
    isPositive: boolean;
    isNeutral: boolean;
}

interface CalendarWidgetProps {
    dailyPerformance: Map<string, DayPerformance>;
}

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

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarWidget({ dailyPerformance }: CalendarWidgetProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [direction, setDirection] = useState(0);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const current = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            const dateStr = current.toISOString().split("T")[0];
            const dayPerformance = dailyPerformance.get(dateStr);

            days.push({
                date: new Date(current),
                dateStr,
                dayPerformance,
                isCurrentMonth: current.getMonth() === month,
                isToday: current.toDateString() === new Date().toDateString(),
            });
            current.setDate(current.getDate() + 1);
        }
        return days;
    }, [year, month, dailyPerformance]);

    const monthStats = useMemo(() => {
        let totalPnL = 0;
        let winCount = 0;
        let lossCount = 0;
        let trades = 0;

        for (const day of calendarDays) {
            if (day.isCurrentMonth && day.dayPerformance) {
                totalPnL += day.dayPerformance.totalPnL;
                trades += day.dayPerformance.tradeCount;
                if (day.dayPerformance.totalPnL > 0) winCount++;
                else if (day.dayPerformance.totalPnL < 0) lossCount++;
            }
        }

        const totalDays = winCount + lossCount;
        const winRate = totalDays > 0 ? (winCount / totalDays) * 100 : 0;

        return { totalPnL, winRate, trades };
    }, [calendarDays]);

    // Calculate weekly stats
    const weeklyStats = useMemo(() => {
        const weeks: {
            weekNum: number;
            totalPnL: number;
            tradingDays: number;
        }[] = [];

        for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
            const weekStart = weekIndex * 7;
            const weekEnd = weekStart + 7;
            const weekDays = calendarDays.slice(weekStart, weekEnd);

            let totalPnL = 0;
            let tradingDays = 0;

            for (const day of weekDays) {
                if (day.isCurrentMonth && day.dayPerformance) {
                    totalPnL += day.dayPerformance.totalPnL;
                    tradingDays++;
                }
            }

            // Only add weeks that have at least one day in the current month
            const hasCurrentMonthDays = weekDays.some((d) => d.isCurrentMonth);
            if (hasCurrentMonthDays) {
                weeks.push({
                    weekNum: weeks.length + 1,
                    totalPnL,
                    tradingDays,
                });
            }
        }

        return weeks;
    }, [calendarDays]);

    const navigateMonth = (val: number) => {
        setDirection(val);
        setCurrentDate((prev) => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() + val);
            return next;
        });
    };

    return (
        <Card className="overflow-hidden border border-zinc-800/50 bg-background ring-1 ring-white/2 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-zinc-800/50 pb-4">
                <div className="flex flex-col gap-1">
                    <CardTitle className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        Trading Activity
                        <div className="flex items-center gap-1.5 rounded-none bg-zinc-900/50 border border-zinc-800/40 px-2.5 py-1 font-medium text-[10px] text-zinc-400 uppercase tracking-wider">
                            <RiInformationLine className="size-3" />
                            Live Performance
                        </div>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-zinc-400 text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span>
                                Monthly PnL:{" "}
                                <span
                                    className={cn(
                                        "font-bold",
                                        monthStats.totalPnL >= 0
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                    )}
                                >
                                    {monthStats.totalPnL >= 0 ? "+" : ""}
                                    {monthStats.totalPnL.toFixed(2)}%
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                            <span>
                                Win Rate:{" "}
                                <span className="font-bold text-white">
                                    {monthStats.winRate.toFixed(1)}%
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center overflow-hidden rounded-none border border-zinc-800 bg-zinc-900/50 p-0.5">
                        <Button
                            onClick={() => navigateMonth(-1)}
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-none hover:bg-zinc-800"
                        >
                            <RiArrowLeftSLine className="size-5" />
                        </Button>
                        <div className="min-w-[140px] px-3 text-center font-bold text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                            {monthNames[month]} {year}
                        </div>
                        <Button
                            onClick={() => navigateMonth(1)}
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-none hover:bg-zinc-800"
                        >
                            <RiArrowRightSLine className="size-5" />
                        </Button>
                    </div>
                    <Button
                        onClick={() => {
                            setDirection(currentDate > new Date() ? -1 : 1);
                            setCurrentDate(new Date());
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-9 px-4 font-bold text-[10px] uppercase tracking-widest border border-zinc-800 bg-zinc-900 rounded-none"
                    >
                        Today
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="flex">
                    {/* Calendar Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-7 border-b border-zinc-800/50 bg-zinc-900/30">
                            {dayNames.map((day) => (
                                <div
                                    key={day}
                                    className="py-3 text-center font-bold text-[10px] text-zinc-500 uppercase tracking-widest"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="relative overflow-hidden">
                            <AnimatePresence
                                initial={false}
                                mode="popLayout"
                                custom={direction}
                            >
                                <motion.div
                                    key={currentDate.toISOString()}
                                    custom={direction}
                                    initial={{
                                        x: `${direction * 100}%`,
                                        opacity: 0,
                                    }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{
                                        x: `${direction * -100}%`,
                                        opacity: 0,
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                    className="grid grid-cols-7 gap-px bg-zinc-800/50"
                                >
                                    {calendarDays.map((day) => (
                                        <CalendarCell
                                            key={day.dateStr}
                                            day={day}
                                        />
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Weekly Stats Column */}
                    <div className="w-28 shrink-0 border-l border-zinc-800/50 bg-zinc-900/30">
                        <div className="py-3 text-center font-bold text-[10px] text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
                            Weekly
                        </div>
                        <div className="flex flex-col">
                            {weeklyStats.map((week, index) => (
                                <div
                                    key={week.weekNum}
                                    className={cn(
                                        "flex flex-col items-center justify-center py-3 border-b border-zinc-800/50 last:border-b-0",
                                        index < 6 ? "min-h-[120px]" : ""
                                    )}
                                >
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                                        Week {week.weekNum}
                                    </span>
                                    <span
                                        className={cn(
                                            "font-bold text-sm mt-1",
                                            week.totalPnL > 0
                                                ? "text-emerald-400"
                                                : week.totalPnL < 0
                                                  ? "text-red-400"
                                                  : "text-zinc-500"
                                        )}
                                    >
                                        {week.totalPnL > 0 ? "+" : ""}
                                        {week.totalPnL.toFixed(2)}%
                                    </span>
                                    <span className="text-[9px] text-zinc-500 mt-0.5 font-medium uppercase tracking-widest opacity-70">
                                        {week.tradingDays}{" "}
                                        {week.tradingDays === 1
                                            ? "day"
                                            : "days"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800/50 bg-zinc-900/30 px-6 py-4">
                    <div className="flex items-center gap-6">
                        <LegendItem color="bg-emerald-400" label="Profit" />
                        <LegendItem color="bg-red-400" label="Loss" />
                        <LegendItem color="bg-zinc-800" label="Neutral" />
                    </div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic opacity-70">
                        Showing performance for {monthStats.trades} trades this
                        month
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface CalendarDay {
    date: Date;
    dateStr: string;
    dayPerformance?: DayPerformance;
    isCurrentMonth: boolean;
    isToday: boolean;
}

function CalendarCellHeatmap({
    pnl,
    intensity,
    isCurrentMonth,
}: {
    pnl: number;
    intensity: number;
    isCurrentMonth: boolean;
}) {
    return (
        <div
            className={cn(
                "absolute inset-0 transition-opacity duration-500",
                pnl > 0
                    ? "bg-emerald-400"
                    : pnl < 0
                      ? "bg-red-400"
                      : "bg-zinc-800"
            )}
            style={{
                opacity: isCurrentMonth ? 0.15 + intensity * 0.25 : 0.05,
            }}
        />
    );
}

function CalendarCellPnL({ pnl }: { pnl: number }) {
    return (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-2">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
            >
                <span
                    className={cn(
                        "font-black text-lg leading-none tracking-tighter drop-shadow-sm",
                        pnl > 0
                            ? "text-emerald-400"
                            : pnl < 0
                              ? "text-red-400"
                              : "text-zinc-500"
                    )}
                >
                    {pnl > 0 ? "+" : ""}
                    {pnl.toFixed(2)}%
                </span>
            </motion.div>
        </div>
    );
}

function CalendarCellFooter({
    tradeCount,
    pnl,
}: {
    tradeCount: number;
    pnl: number;
}) {
    return (
        <div className="relative z-10 flex items-center justify-center border-t border-zinc-800/50 pt-2">
            <div className="flex items-center gap-1.5">
                <div
                    className={cn(
                        "h-1 w-1 rounded-full",
                        pnl > 0
                            ? "bg-emerald-400"
                            : pnl < 0
                              ? "bg-red-400"
                              : "bg-zinc-500"
                    )}
                />
                <span className="font-bold text-[9px] text-zinc-500 uppercase tracking-widest transition-colors group-hover:text-zinc-300">
                    {tradeCount} {tradeCount > 1 ? "Trades" : "Trade"}
                </span>
            </div>
        </div>
    );
}

function CalendarCell({ day }: { day: CalendarDay }) {
    const pnl = day.dayPerformance?.totalPnL ?? 0;
    const tradeCount = day.dayPerformance?.tradeCount ?? 0;

    // Intensity for heatmap (0 to 1)
    const intensity = Math.min(Math.abs(pnl) / 5, 1);

    return (
        <div
            className={cn(
                "group relative flex min-h-[120px] flex-col bg-background p-3 transition-all duration-500 hover:z-20",
                !day.isCurrentMonth &&
                    "bg-zinc-900/10 opacity-40 hover:opacity-100",
                day.isToday && "ring-2 ring-white ring-inset z-10"
            )}
        >
            {/* Heatmap Background Layer */}
            {day.dayPerformance && (
                <CalendarCellHeatmap
                    pnl={pnl}
                    intensity={intensity}
                    isCurrentMonth={day.isCurrentMonth}
                />
            )}

            <div className="relative z-10 flex items-center justify-between">
                <span
                    className={cn(
                        "font-black text-[10px] uppercase tracking-widest transition-colors",
                        day.isToday
                            ? "text-primary"
                            : "text-muted-foreground/40 group-hover:text-foreground"
                    )}
                >
                    {day.date
                        .toLocaleDateString("en-US", { month: "short" })
                        .toUpperCase()}{" "}
                    {day.date.getDate().toString().padStart(2, "0")}
                </span>

                {day.isToday && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                )}
            </div>

            {day.dayPerformance ? (
                <CalendarCellPnL pnl={pnl} />
            ) : (
                <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-2">
                    <div className="h-px w-6 bg-zinc-800/50" />
                </div>
            )}

            {day.dayPerformance ? (
                <CalendarCellFooter tradeCount={tradeCount} pnl={pnl} />
            ) : (
                <div className="relative z-10 flex items-center justify-center border-t border-zinc-800/50 pt-2">
                    <span className="font-bold text-[9px] text-zinc-500/30 uppercase tracking-widest italic">
                        No activity
                    </span>
                </div>
            )}

            {/* Outer Glow Effect on Hover */}
            <div
                className={cn(
                    "pointer-events-none absolute inset-0 border-2 border-transparent opacity-0 transition-all duration-300 group-hover:opacity-100",
                    pnl > 0
                        ? "group-hover:border-emerald-400/40 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                        : pnl < 0
                          ? "group-hover:border-red-400/40 group-hover:shadow-[0_0_20px_rgba(248,113,113,0.15)]"
                          : "group-hover:border-zinc-800"
                )}
            />
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", color)} />
            <span className="font-bold text-[9px] text-zinc-500 uppercase tracking-widest">
                {label}
            </span>
        </div>
    );
}
