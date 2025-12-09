"use client";

import {
    RiArrowDownLine,
    RiArrowUpLine,
    RiBarChartLine,
    RiCalendarLine,
    RiInformationLine,
} from "@remixicon/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RouterOutput } from "@/orpc/client";

interface TradingAnalyticsWidgetProps {
    stats: RouterOutput["trading"]["getStats"];
    trades: RouterOutput["trading"]["getTrades"];
}

function InfoTooltip({ content }: { content: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <RiInformationLine className="h-3.5 w-3.5 cursor-help text-muted-foreground opacity-50 transition-opacity hover:opacity-100" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px] text-xs leading-relaxed">
                {content}
            </TooltipContent>
        </Tooltip>
    );
}

export function TradingAnalyticsWidget({
    stats,
    trades,
}: TradingAnalyticsWidgetProps) {
    // Calculate day of week distribution
    const dayDistribution = (() => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayData = days.map((day) => ({
            day,
            trades: 0,
            pnl: 0,
            wins: 0,
        }));

        if (!trades || trades.length === 0) {
            return dayData;
        }

        for (const trade of trades) {
            const date = new Date(trade.tradeDate);
            const dayIndex = date.getDay();
            const pnl = Number(trade.profitLossPercentage) || 0;
            dayData[dayIndex].trades++;
            dayData[dayIndex].pnl += pnl;
            if (pnl > 0) {
                dayData[dayIndex].wins++;
            }
        }

        return dayData;
    })();

    // Find best and worst days
    const tradingDays = dayDistribution.filter((d) => d.trades > 0);
    const bestDay =
        tradingDays.length > 0
            ? tradingDays.reduce(
                  (best, day) => (day.pnl > best.pnl ? day : best),
                  tradingDays[0]
              )
            : null;
    const worstDay =
        tradingDays.length > 0
            ? tradingDays.reduce(
                  (worst, day) => (day.pnl < worst.pnl ? day : worst),
                  tradingDays[0]
              )
            : null;

    // Calculate best/worst trades
    const sortedTrades = trades
        ? [...trades]
              .filter((t) => t.profitLossPercentage)
              .sort(
                  (a, b) =>
                      Number(b.profitLossPercentage) -
                      Number(a.profitLossPercentage)
              )
        : [];

    const bestTrade = sortedTrades[0];
    const worstTrade = sortedTrades.at(-1);

    // Calculate average holding time (if we have entry/exit times)
    const avgHoldingTime = (() => {
        if (!trades || trades.length === 0) {
            return null;
        }
        // let totalMinutes = 0;
        // let count = 0;

        // for (const trade of trades) {
        //     if (trade.entryTime && trade.exitTime) {
        //         const entry = new Date(`1970-01-01T${trade.entryTime}`);
        //         const exit = new Date(`1970-01-01T${trade.exitTime}`);
        //         let diff = (exit.getTime() - entry.getTime()) / (1000 * 60);
        //         if (diff < 0) {
        //             diff += 24 * 60; // Handle overnight trades
        //         }
        //         totalMinutes += diff;
        //         count++;
        //     }
        // }

        // if (count === 0) {
        //     return null;
        // }
        // const avgMinutes = totalMinutes / count;
        // if (avgMinutes < 60) {
        //     return `${Math.round(avgMinutes)}m`;
        // }
        // const hours = Math.floor(avgMinutes / 60);
        // const mins = Math.round(avgMinutes % 60);
        // return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    })();

    // Calculate max drawdown from trades
    const maxDrawdown = (() => {
        if (!trades || trades.length === 0) {
            return 0;
        }

        const sortedByDate = [...trades].sort(
            (a, b) =>
                new Date(a.tradeDate).getTime() -
                new Date(b.tradeDate).getTime()
        );

        let cumulative = 0;
        let peak = 0;
        let maxDD = 0;

        for (const trade of sortedByDate) {
            const pnl = Number(trade.profitLossPercentage) || 0;
            cumulative += pnl;
            if (cumulative > peak) {
                peak = cumulative;
            }
            const drawdown = peak - cumulative;
            if (drawdown > maxDD) {
                maxDD = drawdown;
            }
        }

        return maxDD;
    })();

    // Calculate Long vs Short distribution
    const directionStats = (() => {
        if (!trades || trades.length === 0) {
            return { long: 0, short: 0, longPnL: 0, shortPnL: 0 };
        }

        // let longCount = 0;
        // let shortCount = 0;
        // let longPnL = 0;
        // let shortPnL = 0;

        // for (const trade of trades) {
        //     const pnl = Number(trade.profitLossPercentage) || 0;
        //     if (trade.direction === "LONG") {
        //         longCount++;
        //         longPnL += pnl;
        //     } else if (trade.direction === "SHORT") {
        //         shortCount++;
        //         shortPnL += pnl;
        //     }
        // }

        // return { long: longCount, short: shortCount, longPnL, shortPnL };
    })();

    const hasTrades = trades && trades.length > 0;
    const maxDayTrades = Math.max(...dayDistribution.map((d) => d.trades), 1);

    return (
        <TooltipProvider delayDuration={100}>
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-medium text-base">
                        Trading Analytics
                        <InfoTooltip content="Advanced trading metrics and patterns analysis to help identify your strengths and weaknesses." />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {hasTrades ? (
                        <div className="space-y-4">
                            {/* Best/Worst Trade */}
                            <div className="grid grid-cols-2 gap-3">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-help rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                                            <div className="mb-1 flex items-center gap-1.5 text-emerald-600 text-xs dark:text-emerald-400">
                                                <RiArrowUpLine className="h-3 w-3" />
                                                Best trade
                                            </div>
                                            <span className="font-bold text-emerald-500 text-lg">
                                                +
                                                {Number(
                                                    bestTrade?.profitLossPercentage ||
                                                        0
                                                ).toFixed(2)}
                                                %
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        Your single most profitable trade in
                                        percentage terms
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-help rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                                            <div className="mb-1 flex items-center gap-1.5 text-rose-600 text-xs dark:text-rose-400">
                                                <RiArrowDownLine className="h-3 w-3" />
                                                Worst trade
                                            </div>
                                            <span className="font-bold text-lg text-rose-500">
                                                {Number(
                                                    worstTrade?.profitLossPercentage ||
                                                        0
                                                ).toFixed(2)}
                                                %
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        Your single biggest losing trade in
                                        percentage terms
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            {/* Max Drawdown & Avg Holding */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-secondary/50 p-3">
                                    <div className="mb-1 flex items-center gap-1.5 text-muted-foreground text-xs">
                                        <span>Max drawdown</span>
                                        <InfoTooltip content="The largest peak-to-trough decline in your cumulative P&L. Lower is better - shows your risk exposure." />
                                    </div>
                                    <span
                                        className={cn(
                                            "font-bold text-lg",
                                            maxDrawdown > 10 && "text-rose-500",
                                            maxDrawdown > 5
                                                ? "text-amber-500"
                                                : "text-foreground"
                                        )}
                                    >
                                        -{maxDrawdown.toFixed(2)}%
                                    </span>
                                </div>
                                {avgHoldingTime && (
                                    <div className="rounded-lg bg-secondary/50 p-3">
                                        <div className="mb-1 flex items-center gap-1.5 text-muted-foreground text-xs">
                                            <span>Avg hold time</span>
                                            <InfoTooltip content="Average duration between entry and exit across all trades with timing data." />
                                        </div>
                                        <span className="font-bold text-lg">
                                            {avgHoldingTime}
                                        </span>
                                    </div>
                                )}
                                {!avgHoldingTime && (
                                    <div className="rounded-lg bg-secondary/50 p-3">
                                        <div className="mb-1 flex items-center gap-1.5 text-muted-foreground text-xs">
                                            <span>Closed trades</span>
                                        </div>
                                        <span className="font-bold text-lg">
                                            {stats.closedTrades}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Long vs Short */}
                            {((directionStats?.long &&
                                directionStats?.long > 0) ||
                                (directionStats?.short &&
                                    directionStats?.short > 0)) && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                        <span>Direction breakdown</span>
                                        <InfoTooltip content="Performance comparison between long (buy) and short (sell) positions." />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 rounded-lg bg-blue-500/10 p-2 text-center">
                                            <span className="block font-medium text-blue-500 text-xs">
                                                Long
                                            </span>
                                            <span className="font-bold text-sm">
                                                {directionStats?.long}
                                            </span>
                                            <span
                                                className={cn(
                                                    "block text-[10px]",
                                                    directionStats?.longPnL >= 0
                                                        ? "text-emerald-500"
                                                        : "text-rose-500"
                                                )}
                                            >
                                                {directionStats?.longPnL >= 0
                                                    ? "+"
                                                    : ""}
                                                {directionStats?.longPnL?.toFixed(
                                                    1
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div className="flex-1 rounded-lg bg-purple-500/10 p-2 text-center">
                                            <span className="block font-medium text-purple-500 text-xs">
                                                Short
                                            </span>
                                            <span className="font-bold text-sm">
                                                {directionStats.short}
                                            </span>
                                            <span
                                                className={cn(
                                                    "block text-[10px]",
                                                    directionStats.shortPnL >= 0
                                                        ? "text-emerald-500"
                                                        : "text-rose-500"
                                                )}
                                            >
                                                {directionStats.shortPnL >= 0
                                                    ? "+"
                                                    : ""}
                                                {directionStats.shortPnL.toFixed(
                                                    1
                                                )}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Day Distribution */}
                            <div className="space-y-2 border-border/50 border-t pt-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                        <RiCalendarLine className="h-3 w-3" />
                                        <span>Activity by day</span>
                                        <InfoTooltip content="Trade distribution and performance by day of week. Helps identify your most/least active and profitable days." />
                                    </div>
                                    {bestDay &&
                                        worstDay &&
                                        bestDay.day !== worstDay.day && (
                                            <div className="flex gap-2 text-[10px]">
                                                <span className="text-emerald-500">
                                                    Best: {bestDay.day}
                                                </span>
                                                <span className="text-rose-500">
                                                    Worst: {worstDay.day}
                                                </span>
                                            </div>
                                        )}
                                </div>
                                <div className="flex justify-between gap-1">
                                    {dayDistribution.map((day) => (
                                        <Tooltip key={day.day}>
                                            <TooltipTrigger asChild>
                                                <div className="flex flex-1 cursor-help flex-col items-center gap-1">
                                                    <div className="relative h-12 w-full overflow-hidden rounded-sm bg-secondary">
                                                        <div
                                                            className={cn(
                                                                "absolute bottom-0 w-full rounded-sm transition-all",
                                                                day.pnl >= 0
                                                                    ? "bg-emerald-500/60"
                                                                    : "bg-rose-500/60"
                                                            )}
                                                            style={{
                                                                height: `${(day.trades / maxDayTrades) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-[9px] text-muted-foreground">
                                                        {day.day}
                                                    </span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">
                                                <div className="font-medium">
                                                    {day.day}
                                                </div>
                                                <div>{day.trades} trades</div>
                                                <div
                                                    className={
                                                        day.pnl >= 0
                                                            ? "text-emerald-500"
                                                            : "text-rose-500"
                                                    }
                                                >
                                                    {day.pnl >= 0 ? "+" : ""}
                                                    {day.pnl.toFixed(2)}%
                                                </div>
                                                {day.trades > 0 && (
                                                    <div>
                                                        Win rate:{" "}
                                                        {(
                                                            (day.wins /
                                                                day.trades) *
                                                            100
                                                        ).toFixed(0)}
                                                        %
                                                    </div>
                                                )}
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground">
                            <RiBarChartLine className="mb-3 h-10 w-10 opacity-20" />
                            <span className="font-medium text-sm">
                                No trading data yet
                            </span>
                            <span className="mt-1 text-center text-xs opacity-70">
                                Log trades to see analytics
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
