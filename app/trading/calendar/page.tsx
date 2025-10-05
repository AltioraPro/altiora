"use client";

import { useState, useMemo } from "react";
import { api } from "@/trpc/client";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface DayPerformance {
date: string;
totalPnL: number;
tradeCount: number;
isPositive: boolean;
isNeutral: boolean;
}

export default function TradingCalendarPage() {
const [currentDate, setCurrentDate] = useState(new Date());
const [viewMode, setViewMode] = useState<'single' | 'quarter' | 'year'>('single');
const [selectedJournalIds, setSelectedJournalIds] = useState<string[]>([]);

const { data: journals } = api.trading.getJournals.useQuery();

const { data: trades, isLoading } = api.trading.getTrades.useQuery({
    journalId: undefined,
    journalIds: selectedJournalIds.length > 0 ? selectedJournalIds : undefined,
    assetId: undefined,
    sessionId: undefined,
    setupId: undefined,
    startDate: undefined,
    endDate: undefined,
    isClosed: true,
});

const dailyPerformance = useMemo(() => {
    if (!trades) return new Map<string, DayPerformance>();

    const performanceMap = new Map<string, DayPerformance>();

    trades.forEach(trade => {
    if (!trade.tradeDate || !trade.isClosed) return;
    
    const tradeDate = new Date(trade.tradeDate).toISOString().split('T')[0];
    const pnlAmount = parseFloat(trade.profitLossAmount || '0');
    
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
    });

    performanceMap.forEach(day => {
    day.isPositive = day.totalPnL > 0;
    day.isNeutral = day.totalPnL === 0;
    });

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
    const dateStr = current.toISOString().split('T')[0];
    const dayPerformance = dailyPerformance.get(dateStr);
    const isCurrentMonth = current.getMonth() === month;
    const isToday = current.toDateString() === new Date().toDateString();
    
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
        days: generateCalendarDays(monthDate)
        });
    }
    
    return calendars;
    } else if (viewMode === "quarter") {
    const year = currentDate.getFullYear();
    const quarterStart = Math.floor(currentDate.getMonth() / 3) * 3;
    const calendars = [];
    
    for (let month = quarterStart; month < quarterStart + 3; month++) {
        const monthDate = new Date(year, month, 1);
        calendars.push({
        month: monthDate,
        days: generateCalendarDays(monthDate)
        });
    }
    
    return calendars;
    } else {
    return [{
        month: currentDate,
        days: generateCalendarDays(currentDate)
    }];
    }
};

const calendars = generateMultipleCalendars();
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const navigatePeriod = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
    const newDate = new Date(prev);
    
    if (viewMode === 'single') {
        if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
        } else {
        newDate.setMonth(newDate.getMonth() + 1);
        }
    } else if (viewMode === 'quarter') {
        if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 3);
        } else {
        newDate.setMonth(newDate.getMonth() + 3);
        }
    } else if (viewMode === 'year') {
        if (direction === 'prev') {
        newDate.setFullYear(newDate.getFullYear() - 1);
        } else {
        newDate.setFullYear(newDate.getFullYear() + 1);
        }
    }
    
    return newDate;
    });
};

const getPeriodTitle = () => {
    if (viewMode === 'single') {
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'quarter') {
    const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
    return `Q${quarter} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'year') {
    return `${currentDate.getFullYear()}`;
    }
    return '';
};

const getPeriodDescription = () => {
    if (viewMode === 'single') {
    return 'Single month view';
    } else if (viewMode === 'quarter') {
    return 'Quarter view - 3 months';
    } else if (viewMode === 'year') {
    return 'Year view - 12 months';
    }
    return '';
};

const handleJournalToggle = (journalId: string) => {
    setSelectedJournalIds(prev => 
    prev.includes(journalId) 
        ? prev.filter(id => id !== journalId)
        : [...prev, journalId]
    );
};

const selectAllJournals = () => {
    if (journals) {
    setSelectedJournalIds(journals.map(j => j.id));
    }
};

const clearJournalSelection = () => {
    setSelectedJournalIds([]);
};

const getDayClassName = (day: { isCurrentMonth: boolean; isToday: boolean; dayPerformance?: DayPerformance }) => {
    let baseClasses = "w-12 h-12 flex flex-col items-center justify-center text-xs rounded-lg transition-colors relative font-semibold";
    
    if (!day.isCurrentMonth) {
    baseClasses += " text-white/30";
    } else if (day.isToday) {
    baseClasses += " bg-white text-black font-bold ring-2 ring-white/50";
    } else if (day.dayPerformance) {
    if (day.dayPerformance.isPositive) {
        baseClasses += " bg-green-600 text-white hover:bg-green-500 shadow-lg";
    } else if (day.dayPerformance.isNeutral) {
        baseClasses += " bg-gray-600 text-white hover:bg-gray-500";
    } else {
        baseClasses += " bg-red-600 text-white hover:bg-red-500 shadow-lg";
    }
    } else {
    baseClasses += " text-white hover:bg-white/10";
    }
    
    return baseClasses;
};

const getDayContent = (day: { dayPerformance?: DayPerformance }) => {
    if (!day.dayPerformance) return null;
    
    const percentage = day.dayPerformance.totalPnL > 0 ? 
    `+${day.dayPerformance.totalPnL.toFixed(1)}%` : 
    `${day.dayPerformance.totalPnL.toFixed(1)}%`;
    
    return (
    <div className="text-[9px] font-bold drop-shadow-sm">
        {percentage}
    </div>
    );
};

const getStats = () => {
    const performanceArray = Array.from(dailyPerformance.values());
    const positiveDays = performanceArray.filter(day => day.isPositive).length;
    const negativeDays = performanceArray.filter(day => !day.isPositive && !day.isNeutral).length;
    const neutralDays = performanceArray.filter(day => day.isNeutral).length;
    const totalDays = performanceArray.length;
    
    return { positiveDays, negativeDays, neutralDays, totalDays };
};

const stats = getStats();

if (isLoading) {
    return (
    <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-7 gap-2 mb-4">
            {[...Array(35)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
        </div>
        </div>
    </div>
    );
}

return (
    <div className="container mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-8">
        <div>
        <h1 className="text-3xl font-argesta text-white mb-2 font-bold">Trading Calendar</h1>
        <p className="text-white/60">
            Track your daily trading performance
        </p>
        </div>
        
        <div className="flex items-center space-x-2">
        <div className="relative group">
            <Button
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
            <Filter className="w-4 h-4 mr-2" />
            Journals filter
            {selectedJournalIds.length > 0 && (
                <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
            )}
            </Button>
            
            {journals && journals.length > 0 && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-black border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50">
                <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white text-sm font-medium">Filter Journals</h3>
                    <div className="flex space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllJournals}
                        className="text-white/60 hover:text-white hover:bg-white/10 text-xs h-6 px-2"
                    >
                        All
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearJournalSelection}
                        className="text-white/60 hover:text-white hover:bg-white/10 text-xs h-6 px-2"
                    >
                        Clear
                    </Button>
                    </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {journals.map((journal) => (
                    <div
                        key={journal.id}
                        className="flex items-center space-x-2 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => handleJournalToggle(journal.id)}
                    >
                        <Checkbox
                        checked={selectedJournalIds.includes(journal.id)}
                        onChange={() => handleJournalToggle(journal.id)}
                        className="border-white/20"
                        />
                        <span className="text-white text-xs font-medium truncate">{journal.name}</span>
                    </div>
                    ))}
                </div>
                {selectedJournalIds.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-white/60 text-xs">
                        {selectedJournalIds.length} journal{selectedJournalIds.length > 1 ? 's' : ''} selected
                    </p>
                    </div>
                )}
                </div>
                <div className="absolute -top-2 left-0 right-0 h-2 pointer-events-auto"></div>
            </div>
            )}
        </div>
        
        <Link href="/trading/journals">
            <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Journals
            </Button>
        </Link>
        </div>
    </div>


    <Card className="border border-white/10 bg-black/20 mb-6">
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
                key={mode.key}
                variant={viewMode === mode.key ? "default" : "outline"}
                onClick={() => setViewMode(mode.key as 'single' | 'quarter' | 'year')}
                className={`h-10 flex items-center justify-center text-sm ${
                viewMode === mode.key
                    ? "bg-white text-black hover:bg-gray-200"
                    : "border-white/20 bg-transparent text-white hover:bg-white/10"
                }`}
            >
                <span className="font-medium">{mode.label}</span>
            </Button>
            ))}
        </div>
        </CardContent>
    </Card>

    <section className="mb-10">
        <h2 className="text-lg font-medium text-gray-300 mb-6 tracking-tight">
            All Time Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-white/10 bg-pure-black">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                        Positive Days
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-semibold text-white">{stats.positiveDays}</div>
                    <p className="text-xs text-gray-400 mt-1">
                        {stats.totalDays > 0 ? Math.round((stats.positiveDays / stats.totalDays) * 100) : 0}% of total
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-white/10 bg-pure-black">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                        Negative Days
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-semibold text-white">{stats.negativeDays}</div>
                    <p className="text-xs text-gray-400 mt-1">
                        {stats.totalDays > 0 ? Math.round((stats.negativeDays / stats.totalDays) * 100) : 0}% of total
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-white/10 bg-pure-black">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                        Neutral Days
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-semibold text-white">{stats.neutralDays}</div>
                    <p className="text-xs text-gray-400 mt-1">
                        {stats.totalDays > 0 ? Math.round((stats.neutralDays / stats.totalDays) * 100) : 0}% of total
                    </p>
                </CardContent>
            </Card>

            <Card className="border border-white/10 bg-pure-black">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                        Total Days
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-semibold text-white">{stats.totalDays}</div>
                    <p className="text-xs text-gray-400 mt-1">with trades</p>
                </CardContent>
            </Card>
        </div>
    </section>
    {selectedJournalIds.length > 0 && (
    <div className="mt-6 mb-6 text-center text-white/70 text-sm">
        <div className="inline-flex items-center gap-4 justify-center">
        <span>
            <span className="inline-block w-3 h-3 rounded-full bg-green-400 opacity-75 mr-1 align-middle" />
            <span className="align-middle">Green</span>: Positive day
        </span>
        <span>
            <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-1 align-middle" />
            <span className="align-middle">Gray</span>: Neutral day
        </span>
        <span>
            <span className="inline-block w-3 h-3 rounded-full bg-red-400 opacity-75 mr-1 align-middle" />
            <span className="align-middle">Red</span>: Negative day
        </span>
        </div>
    </div>
    )}
    {selectedJournalIds.length > 0 && viewMode === 'single' ? (
        calendars.map((calendar, calendarIndex) => (
        <Card key={calendarIndex} className="border border-white/10 bg-black/20 mb-6">
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
                    variant="outline"
                    size="sm"
                    onClick={() => navigatePeriod('prev')}
                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                    Today
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigatePeriod('next')}
                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
                </div>
            </div>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-white/60 py-2">
                    {day}
                </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
                {calendar.days.map((day, index) => (
                <div
                    key={index}
                    className={`${getDayClassName(day)} group`}
                    title={day.dayPerformance ? 
                    `${day.date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })} - PnL: ${day.dayPerformance.totalPnL.toFixed(2)}%, Trades: ${day.dayPerformance.tradeCount}` : 
                    `${day.date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })} - No trades`
                    }
                >
                    <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-xs font-medium">{day.date.getDate()}</span>
                    {getDayContent(day)}
                    </div>
                    
                    {day.dayPerformance && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                        <div className="font-semibold">
                        {day.date.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                        </div>
                        <div className="text-green-400">
                        PnL: {day.dayPerformance.totalPnL > 0 ? '+' : ''}{day.dayPerformance.totalPnL.toFixed(2)}%
                        </div>
                        <div className="text-gray-300">
                        Trades: {day.dayPerformance.tradeCount}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
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
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod('prev')}
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                Today
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod('next')}
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className={`grid gap-4 ${viewMode === 'year' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {calendars.map((calendar, calendarIndex) => (
                <div key={calendarIndex} className="bg-black/10 rounded-lg p-3">
                <div className="text-center mb-3">
                    <h3 className="text-sm font-semibold text-white">
                    {monthNames[calendar.month.getMonth()]}
                    </h3>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-white/60 py-1">
                        {day}
                    </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                    {calendar.days.map((day, index) => (
                    <div
                        key={index}
                        className={`w-8 h-8 flex flex-col items-center justify-center text-xs rounded transition-colors relative font-semibold group ${
                        !day.isCurrentMonth ? "text-white/30" :
                        day.isToday ? "bg-white text-black font-bold" :
                        day.dayPerformance ? (
                            day.dayPerformance.isPositive ? "bg-green-600 opacity-75 text-white" :
                            day.dayPerformance.isNeutral ? "bg-gray-600 text-white" :
                            "bg-red-600 opacity-75 text-white"
                        ) : "text-white hover:bg-white/10"
                        }`}
                        title={day.dayPerformance ? 
                        `${day.date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })} - PnL: ${day.dayPerformance.totalPnL.toFixed(2)}%, Trades: ${day.dayPerformance.tradeCount}` : 
                        `${day.date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })} - No trades`
                        }
                    >
                        <span className="text-[9px] font-medium">{day.date.getDate()}</span>
                        {day.dayPerformance && (
                        <div className="text-[7px] font-bold">
                            {day.dayPerformance.totalPnL > 0 ? 
                            `+${day.dayPerformance.totalPnL.toFixed(0)}%` : 
                            `${day.dayPerformance.totalPnL.toFixed(0)}%`
                            }
                        </div>
                        )}
                        
                        {day.dayPerformance && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                            <div className="font-semibold">
                            {day.date.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric' 
                            })}
                            </div>
                            <div className="text-green-400">
                            PnL: {day.dayPerformance.totalPnL > 0 ? '+' : ''}{day.dayPerformance.totalPnL.toFixed(2)}%
                            </div>
                            <div className="text-gray-300">
                            Trades: {day.dayPerformance.tradeCount}
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
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
        <div className="text-center py-8 mb-6">
            <div className="inline-flex items-center space-x-2 text-white/40">
                <CalendarIcon className="w-5 h-5" />
                <span className="text-sm">No journals selected</span>
            </div>
            <p className="text-white/30 text-xs mt-2">
                Use the filter above to select journals and view your performance
            </p>
        </div>
    )}
    </div>
);
}
