"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    RiArrowRightUpLine,
    RiCameraLine,
    RiDeleteBinLine,
    RiDraggable,
    RiEditLine,
    RiLoader2Line,
    RiMoreLine,
    RiWifiLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { PAGES } from "@/constants/pages";
import { orpc, type RouterOutput } from "@/orpc/client";

interface JournalCardProps {
    journal: RouterOutput["trading"]["getJournalById"];
    onEdit: () => void;
    onDelete: () => void;
}

// Flex Capture Content - Hidden component for screenshot
interface FlexCaptureContentProps {
    journal: RouterOutput["trading"]["getJournalById"];
    stats: RouterOutput["trading"]["getStats"] | undefined;
    chartData: Array<{ tradeNumber: number; cumulative: number }>;
    isPositive: boolean;
    finalCumulative: number;
}

const FlexCaptureContent = React.forwardRef<
    HTMLDivElement,
    FlexCaptureContentProps
>(({ journal, stats, chartData, isPositive, finalCumulative }, ref) => (
    <div
        ref={ref}
        style={{
            position: "fixed",
            top: "-9999px",
            left: "0",
            width: "380px",
            borderRadius: "1rem",
            backgroundColor: "#09090b",
            overflow: "hidden",
        }}
    >
        {/* Background Chart */}
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.2,
            }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient
                            id="flex-bg-gradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor={isPositive ? "#22c55e" : "#ef4444"}
                                stopOpacity={isPositive ? 0.6 : 0.1}
                            />
                            <stop
                                offset="100%"
                                stopColor={isPositive ? "#22c55e" : "#ef4444"}
                                stopOpacity={isPositive ? 0.1 : 0.6}
                            />
                        </linearGradient>
                    </defs>
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke={isPositive ? "#22c55e" : "#ef4444"}
                        strokeWidth={2}
                        fill="url(#flex-bg-gradient)"
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>

        {/* Content */}
        <div
            style={{
                position: "relative",
                zIndex: 10,
                padding: "2rem",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <p
                    style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "rgba(255, 255, 255, 0.4)",
                        marginBottom: "0.25rem",
                    }}
                >
                    Trading Journal
                </p>
                <h2
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: "600",
                        color: "#ffffff",
                        margin: 0,
                    }}
                >
                    {journal.name}
                </h2>
            </div>

            {/* Main Performance */}
            <div style={{ marginBottom: "2rem" }}>
                <p
                    style={{
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "rgba(255, 255, 255, 0.35)",
                        marginBottom: "0.5rem",
                    }}
                >
                    Total Performance
                </p>
                <div
                    style={{
                        fontSize: "3.5rem",
                        fontWeight: "700",
                        color: isPositive ? "#4ade80" : "#f87171",
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                    }}
                >
                    {isPositive ? "+" : ""}
                    {finalCumulative.toFixed(2)}%
                </div>
            </div>

            {stats && (
                <>
                    {/* Stats Row */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "1.5rem",
                            paddingTop: "1.5rem",
                            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                    >
                        <div>
                            <p
                                style={{
                                    fontSize: "0.6rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    color: "rgba(255, 255, 255, 0.35)",
                                    marginBottom: "0.35rem",
                                }}
                            >
                                Win Rate
                            </p>
                            <p
                                style={{
                                    fontSize: "1.25rem",
                                    fontWeight: "600",
                                    color: "#ffffff",
                                    margin: 0,
                                }}
                            >
                                {stats.winRate.toFixed(0)}%
                            </p>
                        </div>
                        <div>
                            <p
                                style={{
                                    fontSize: "0.6rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    color: "rgba(255, 255, 255, 0.35)",
                                    marginBottom: "0.35rem",
                                }}
                            >
                                Trades
                            </p>
                            <p
                                style={{
                                    fontSize: "1.25rem",
                                    fontWeight: "600",
                                    color: "#ffffff",
                                    margin: 0,
                                }}
                            >
                                {stats.totalTrades}
                            </p>
                        </div>
                        <div>
                            <p
                                style={{
                                    fontSize: "0.6rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    color: "rgba(255, 255, 255, 0.35)",
                                    marginBottom: "0.35rem",
                                }}
                            >
                                Profit Factor
                            </p>
                            <p
                                style={{
                                    fontSize: "1.25rem",
                                    fontWeight: "600",
                                    color: "#ffffff",
                                    margin: 0,
                                }}
                            >
                                {stats.profitFactor?.toFixed(2) || "—"}
                            </p>
                        </div>
                    </div>

                    {/* Secondary Stats */}
                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            marginTop: "1.25rem",
                            paddingTop: "1.25rem",
                            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.35rem",
                            }}
                        >
                            <div
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "#4ade80",
                                }}
                            />
                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    color: "rgba(255, 255, 255, 0.6)",
                                }}
                            >
                                {stats.tpTrades} TP
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.35rem",
                            }}
                        >
                            <div
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "#a1a1aa",
                                }}
                            />
                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    color: "rgba(255, 255, 255, 0.6)",
                                }}
                            >
                                {stats.beTrades} BE
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.35rem",
                            }}
                        >
                            <div
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "#f87171",
                                }}
                            />
                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    color: "rgba(255, 255, 255, 0.6)",
                                }}
                            >
                                {stats.slTrades} SL
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Footer */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "2rem",
                    paddingTop: "1.25rem",
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <Image
                        alt="Altiora"
                        height={16}
                        src="/img/logo.png"
                        width={16}
                    />
                    <span
                        style={{
                            color: "rgba(255, 255, 255, 0.5)",
                            fontSize: "0.8rem",
                            fontWeight: "500",
                        }}
                    >
                        altiora.pro
                    </span>
                </div>
                <span
                    style={{
                        color: "rgba(255, 255, 255, 0.3)",
                        fontSize: "0.7rem",
                    }}
                >
                    {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    })}
                </span>
            </div>
        </div>
    </div>
));
FlexCaptureContent.displayName = "FlexCaptureContent";

function JournalCardContent({ journal, onEdit, onDelete }: JournalCardProps) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const flexCardRef = useRef<HTMLDivElement>(null);

    const { data: tradesData } = useQuery(
        orpc.trading.getTrades.queryOptions({
            input: { journalId: journal.id },
            enabled: !!journal.id,
        })
    );

    const { data: stats } = useQuery(
        orpc.trading.getStats.queryOptions({
            input: { journalId: journal.id },
            enabled: !!journal.id,
        })
    );

    const { data: connectionsData } = useQuery(
        orpc.integrations.ctrader.getConnections.queryOptions({
            input: {},
            retry: false,
        })
    );

    const { data: brokerConnection } = useQuery(
        orpc.integrations.getBrokerConnection.queryOptions({
            input: { journalId: journal.id },
        })
    );

    const isCTraderConnected =
        connectionsData?.connections?.some(
            (c) => c.journalId === journal.id && c.isActive
        ) ?? false;

    const isMetaTraderConnected =
        brokerConnection?.provider === "metatrader" &&
        brokerConnection?.isActive;

    const isConnected = isCTraderConnected || isMetaTraderConnected;

    const cumulativeData = useMemo(() => {
        if (!tradesData || tradesData.length === 0) {
            return [{ x: 0, y: 0 }];
        }

        return tradesData
            .slice()
            .sort(
                (a, b) =>
                    new Date(a.tradeDate).getTime() -
                    new Date(b.tradeDate).getTime()
            )
            .reduce(
                (acc, trade, index) => {
                    const pnl = Number(trade.profitLossPercentage);
                    const previous = acc.length > 0 ? (acc.at(-1)?.y ?? 0) : 0;
                    acc.push({
                        x: index + 1,
                        y: previous + pnl,
                    });
                    return acc;
                },
                [] as Array<{ x: number; y: number }>
            );
    }, [tradesData]);

    // Chart data for Flex capture (needs tradeNumber key)
    const chartDataForFlex = useMemo(() => {
        if (!tradesData || tradesData.length === 0) {
            return [{ tradeNumber: 0, cumulative: 0 }];
        }

        return tradesData
            .slice()
            .sort(
                (a, b) =>
                    new Date(a.tradeDate).getTime() -
                    new Date(b.tradeDate).getTime()
            )
            .reduce(
                (acc, trade, index) => {
                    const pnl = Number(trade.profitLossPercentage);
                    const previous = acc.length > 0 ? (acc.at(-1)?.cumulative ?? 0) : 0;
                    acc.push({
                        tradeNumber: index + 1,
                        cumulative: previous + pnl,
                    });
                    return acc;
                },
                [] as Array<{ tradeNumber: number; cumulative: number }>
            );
    }, [tradesData]);

    const totalPnL = stats?.totalPnL ?? 0;
    const isPositive = totalPnL >= 0;
    const winRate = stats?.winRate ?? 0;
    const totalTrades = stats?.totalTrades ?? 0;
    const finalCumulative = chartDataForFlex.length > 0 ? (chartDataForFlex.at(-1)?.cumulative ?? 0) : totalPnL;

    const handleFlexCapture = async () => {
        if (!flexCardRef.current) return;
        setIsCapturing(true);
        try {
            const canvas = await html2canvas(flexCardRef.current, {
                backgroundColor: "#0a0a0a",
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                width: flexCardRef.current.scrollWidth,
                height: flexCardRef.current.scrollHeight,
            });
            setCapturedImage(canvas.toDataURL("image/png", 0.95));
            setShowPreview(true);
        } catch (error) {
            console.error("Capture error:", error);
        } finally {
            setIsCapturing(false);
        }
    };

    const handleDownload = () => {
        if (!capturedImage) return;
        const link = document.createElement("a");
        link.href = capturedImage;
        link.download = `altiora-${journal.name.replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setCapturedImage(null);
    };

    return (
        <>
            {/* Hidden Flex Capture Content */}
            <FlexCaptureContent
                ref={flexCardRef}
                journal={journal}
                stats={stats}
                chartData={chartDataForFlex}
                isPositive={isPositive}
                finalCumulative={finalCumulative}
            />

            <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]">
                {/* Content */}
                <div className="flex flex-1 flex-col p-5 pb-3">
                    {/* Header */}
                    <div className="mb-3">
                        <div className="mb-1 flex items-center gap-2">
                            <h3 className="truncate font-medium text-white">
                                {journal.name}
                            </h3>
                            {isConnected && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <RiWifiLine className="size-3.5 text-green-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">
                                                Synced with{" "}
                                                {isCTraderConnected
                                                    ? "cTrader"
                                                    : "MetaTrader"}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            {/* Drag Handle */}
                            <div className="ml-auto cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
                                <RiDraggable className="size-4 text-white/30" />
                            </div>
                        </div>
                        {journal.description && (
                            <p className="line-clamp-1 text-xs text-white/40">
                                {journal.description}
                            </p>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-end justify-between">
                        <div>
                            <p
                                className={`font-semibold text-2xl tabular-nums tracking-tight ${isPositive ? "text-green-400" : "text-red-400"}`}
                            >
                                {isPositive ? "+" : ""}
                                {totalPnL.toFixed(2)}
                                <span className="text-sm">%</span>
                            </p>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-white/50">
                                <span>{winRate.toFixed(0)}% win</span>
                                <span className="text-white/20">•</span>
                                <span>{totalTrades} trades</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="h-14 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cumulativeData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient
                                    id={`chart-gradient-pos-${journal.id}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#22c55e"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#22c55e"
                                        stopOpacity={0.05}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id={`chart-gradient-neg-${journal.id}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#ef4444"
                                        stopOpacity={0.05}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#ef4444"
                                        stopOpacity={0.3}
                                    />
                                </linearGradient>
                            </defs>
                            <YAxis domain={['dataMin', 'dataMax']} hide />
                            <Area
                                type="monotone"
                                dataKey="y"
                                stroke={isPositive ? "#22c55e" : "#ef4444"}
                                strokeWidth={1.5}
                                fill={isPositive ? `url(#chart-gradient-pos-${journal.id})` : `url(#chart-gradient-neg-${journal.id})`}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-white/6 px-4 py-2.5">
                    <div className="flex items-center gap-1">
                        {/* Flex Capture Button */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-white/40 hover:bg-white/5 hover:text-white/70"
                                        onClick={handleFlexCapture}
                                        disabled={isCapturing}
                                    >
                                        {isCapturing ? (
                                            <RiLoader2Line className="size-4 animate-spin" />
                                        ) : (
                                            <RiCameraLine className="size-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Capture for sharing</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* More Actions Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-white/40 hover:bg-white/5 hover:text-white/70"
                                >
                                    <RiMoreLine className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-40">
                                <DropdownMenuItem onClick={onEdit}>
                                    <RiEditLine className="mr-2 size-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={onDelete}
                                    className="text-red-400 focus:text-red-400"
                                >
                                    <RiDeleteBinLine className="mr-2 size-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Button
                        asChild
                        size="sm"
                        className="h-8 gap-1.5 bg-white/10 text-white hover:bg-white/15"
                    >
                        <Link href={PAGES.TRADING_JOURNAL(journal.id)}>
                            Open
                            <RiArrowRightUpLine className="size-3.5" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && capturedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                    role="presentation"
                >
                    <button
                        aria-label="Close"
                        className="absolute inset-0 z-0 h-full w-full cursor-default"
                        onClick={handleClosePreview}
                        type="button"
                    />
                    <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-5 shadow-2xl">
                        <div className="mb-4">
                            <h3 className="font-medium text-lg text-white">
                                Preview
                            </h3>
                            <p className="text-sm text-white/50">
                                Ready to share your performance
                            </p>
                        </div>
                        <div className="mb-5 overflow-hidden rounded-xl border border-white/10">
                            <Image
                                alt="Preview"
                                className="w-full"
                                height={500}
                                src={capturedImage}
                                width={400}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/30">
                                {journal.name}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white/60 hover:bg-white/5 hover:text-white"
                                    onClick={handleClosePreview}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-white text-black hover:bg-white/90"
                                    onClick={handleDownload}
                                >
                                    Download
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

interface DraggableJournalCardProps {
    journal: RouterOutput["trading"]["getJournalById"];
    onEdit: () => void;
    onDelete: () => void;
}

export function MinimalJournalCard({
    journal,
    onEdit,
    onDelete,
}: DraggableJournalCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: journal.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <JournalCardContent
                journal={journal}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
}
