"use client";

import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import {
    Camera,
    Edit,
    ExternalLink,
    Loader2,
    Trash2,
    TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PAGES } from "@/constants/pages";
import { orpc } from "@/orpc/client";

interface JournalPerformanceCardProps {
    journal: {
        id: string;
        name: string;
        description: string | null;
        order: number;
    };
    onEdit: () => void;
    onDelete: () => void;
}

export function JournalPerformanceCard({
    journal,
    onEdit,
    onDelete,
}: JournalPerformanceCardProps) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const flexCardRef = useRef<HTMLDivElement>(null);

    const { data: tradesData } = useQuery(
        orpc.trading.getTrades.queryOptions({
            input: {
                journalId: journal.id,
            },
            enabled: !!journal.id,
        })
    );

    const cumulativeData = useMemo(() => {
        if (!tradesData || tradesData.length === 0) {
            return [];
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

                    const previous =
                        acc.length > 0 ? (acc.at(-1)?.cumulative ?? 0) : 0;
                    const cumulative = previous + pnl;
                    acc.push({ tradeNumber: index + 1, cumulative });
                    return acc;
                },
                [] as Array<{ tradeNumber: number; cumulative: number }>
            );
    }, [tradesData]);

    const chartData =
        cumulativeData.length > 0
            ? cumulativeData
            : [{ tradeNumber: 0, cumulative: 0 }];

    const { data: stats } = useQuery(
        orpc.trading.getStats.queryOptions({
            input: {
                journalId: journal.id,
            },
            enabled: !!journal.id,
        })
    );

    const bestTrade =
        tradesData && tradesData.length > 0
            ? tradesData.reduce((best, current) => {
                const currentPnl = Number(current.profitLossPercentage || 0);
                const bestPnl = Number(best.profitLossPercentage || 0);
                return currentPnl > bestPnl ? current : best;
            })
            : null;

    const finalCumulative =
        cumulativeData.length > 0
            ? (cumulativeData.at(-1)?.cumulative ?? 0)
            : Number(stats?.totalPnL || 0);
    const isPositive = finalCumulative >= 0;

    const handleFlexCapture = async () => {
        if (!flexCardRef.current) {
            return;
        }

        setIsCapturing(true);

        try {
            const canvas = await html2canvas(flexCardRef.current, {
                backgroundColor: "#000000",
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                width: flexCardRef.current.scrollWidth,
                height: flexCardRef.current.scrollHeight,
            });

            const imageDataUrl = canvas.toDataURL("image/png", 0.95);
            setCapturedImage(imageDataUrl);
            setShowPreview(true);
        } catch (error) {
            console.error("Erreur lors de la capture:", error);
        } finally {
            setIsCapturing(false);
        }
    };

    const handleDownload = () => {
        if (!capturedImage) {
            return;
        }

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
            <div
                ref={flexCardRef}
                style={{
                    position: "fixed",
                    top: "-9999px",
                    left: "0",
                    width: "400px",
                    height: "500px",
                    borderRadius: "0.5rem",
                    backgroundColor: "#000000",
                    padding: "1rem",
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)",
                }}
            >
                <div style={{ marginBottom: "1rem", textAlign: "center" }}>
                    <h2 style={{ marginBottom: "0.25rem", fontSize: "1.25rem", lineHeight: "1.75rem", color: "#ffffff" }}>{journal.name}</h2>
                    <p style={{ fontSize: "0.75rem", lineHeight: "1rem", color: "rgba(255, 255, 255, 0.6)" }}>Trading Performance</p>
                </div>

                {stats && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: "bold", fontSize: "1.5rem", lineHeight: "2rem", color: "#4ade80" }}>
                                    {stats.winRate.toFixed(1)}%
                                </div>
                                <div style={{ marginTop: "0.25rem", fontSize: "0.75rem", lineHeight: "1rem", color: "rgba(255, 255, 255, 0.6)" }}>
                                    Win Rate
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: "bold", fontSize: "1.5rem", lineHeight: "2rem", color: "#ffffff" }}>
                                    {stats.totalTrades}
                                </div>
                                <div style={{ marginTop: "0.25rem", fontSize: "0.75rem", lineHeight: "1rem", color: "rgba(255, 255, 255, 0.6)" }}>
                                    Trades
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: "bold", fontSize: "1.5rem", lineHeight: "2rem", color: "#ffffff" }}>
                                    {(() => {
                                        if (!stats) {
                                            return "0.00";
                                        }

                                        const totalPnL =
                                            typeof stats.totalPnL === "string"
                                                ? Number.parseFloat(
                                                    stats.totalPnL
                                                ) || 0
                                                : stats.totalPnL;
                                        const avgWin =
                                            stats.winningTrades > 0
                                                ? totalPnL / stats.winningTrades
                                                : 0;
                                        const avgLoss =
                                            stats.losingTrades > 0
                                                ? Math.abs(totalPnL) /
                                                stats.losingTrades
                                                : 0;
                                        const profitFactor =
                                            avgLoss > 0 ? avgWin / avgLoss : 0;

                                        return profitFactor.toFixed(2);
                                    })()}
                                </div>
                                <div style={{ marginTop: "0.25rem", fontSize: "0.75rem", lineHeight: "1rem", color: "rgba(255, 255, 255, 0.6)" }}>
                                    Profit Factor
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.2)" }} />

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: "bold", fontSize: "1.25rem", lineHeight: "2rem", color: "#4ade80" }}>
                                    {(stats as { maxWinningStreak?: number }).maxWinningStreak || 0}
                                </div>
                                <div style={{ marginTop: "0.25rem", fontSize: "0.60rem", lineHeight: "1rem", color: "rgba(255, 255, 255, 0.6)" }}>
                                    Winning Streak
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: "bold", fontSize: "1.25rem", lineHeight: "2rem", color: "#4ade80" }}>
                                    {stats.tpTrades}
                                </div>
                                <div style={{ marginTop: "0.25rem", fontSize: "0.70rem", lineHeight: "1.25rem", color: "rgba(255, 255, 255, 0.6)" }}>
                                    TP
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: "bold", fontSize: "1.5rem", lineHeight: "2rem", color: "#ffffff" }}>
                                    {stats.beTrades}
                                </div>
                                <div style={{ marginTop: "0.25rem", fontSize: "0.70rem", lineHeight: "1.25rem", color: "rgba(255, 255, 255, 0.6)" }}>
                                    BE
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: "bold", fontSize: "1.5rem", lineHeight: "2rem", color: "#f87171" }}>
                                    {stats.slTrades}
                                </div>
                                <div style={{ marginTop: "0.25rem", fontSize: "0.70rem", lineHeight: "1.25rem", color: "rgba(255, 255, 255, 0.6)" }}>
                                    SL
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: "bold", fontSize: "1.5rem", lineHeight: "2rem", color: "#f87171" }}>
                                    {(stats as { maxLosingStreak?: number }).maxLosingStreak || 0}
                                </div>
                                <div style={{ marginTop: "0.25rem", fontSize: "0.60rem", lineHeight: "1rem", color: "rgba(255, 255, 255, 0.6)" }}>
                                    Losing Streak
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ borderRadius: "0.375rem", border: "1px solid rgba(255, 255, 255, 0.1)", backgroundColor: "rgba(0, 0, 0, 0.2)", padding: "1rem" }}>
                        <div style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", lineHeight: "1rem", color: "rgba(255, 255, 255, 0.6)" }}>
                            <span>Cumulative Performance (%)</span>
                            <span style={{ fontWeight: "600", fontSize: "0.875rem", lineHeight: "1.25rem", color: isPositive ? "#4ade80" : "#f87171" }}>
                                {finalCumulative >= 0 ? "+" : ""}
                                {finalCumulative.toFixed(2)}%
                            </span>
                        </div>
                        <div style={{ height: "8rem" }}>
                            <ResponsiveContainer height="100%" width="100%">
                                <AreaChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 16,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient
                                            id={`journal-cumulative-${journal.id}`}
                                            x1="0"
                                            x2="0"
                                            y1="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor={
                                                    isPositive
                                                        ? "#10b981"
                                                        : "#ef4444"
                                                }
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor={
                                                    isPositive
                                                        ? "#10b981"
                                                        : "#ef4444"
                                                }
                                                stopOpacity={0.05}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        stroke="rgba(255,255,255,0.1)"
                                        vertical={false}
                                    />
                                    <XAxis
                                        axisLine={false}
                                        dataKey="tradeNumber"
                                        stroke="#ffffff"
                                        strokeOpacity={0.4}
                                        tick={{
                                            fontSize: 10,
                                            fill: "rgba(255,255,255,0.5)",
                                        }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        stroke="#ffffff"
                                        strokeOpacity={0.4}
                                        tick={{
                                            fontSize: 10,
                                            fill: "rgba(255,255,255,0.5)",
                                        }}
                                        tickFormatter={(value) =>
                                            `${value.toFixed(0)}%`
                                        }
                                        tickLine={false}
                                    />
                                    <Area
                                        dataKey="cumulative"
                                        dot={false}
                                        fill={`url(#journal-cumulative-${journal.id})`}
                                        isAnimationActive={false}
                                        stroke={
                                            isPositive ? "#10b981" : "#ef4444"
                                        }
                                        strokeWidth={2}
                                        type="monotone"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <Image
                            alt="Altiora"
                            height={16}
                            src="/img/logo.png"
                            style={{ opacity: 0.6 }}
                            width={16}
                        />
                        <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.75rem", lineHeight: "1rem" }}>
                            altiora.pro
                        </span>
                    </div>
                </div>
            </div>

            <Card className="border border-white/10 bg-black/20 transition-all duration-200 hover:border-white/20">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center space-x-2">
                                <CardTitle className="line-clamp-1 text-lg text-white">
                                    {journal.name}
                                </CardTitle>
                            </div>
                            <CardDescription className="line-clamp-2 text-white/60">
                                {journal.description || "No description"}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    {stats && (
                        <div className="mb-4 grid grid-cols-3 gap-3">
                            <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-center">
                                <div
                                    className={`font-bold text-xl ${stats.totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}
                                >
                                    {stats.totalPnL >= 0 ? "+" : ""}
                                    {stats.totalPnL.toFixed(2)}%
                                </div>
                                <div className="text-white/60 text-xs">
                                    Performance
                                </div>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-center">
                                <div className="text-green-400 text-xl">
                                    {stats.winRate.toFixed(1)}%
                                </div>
                                <div className="text-white/60 text-xs">
                                    Win Rate
                                </div>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-center">
                                <div className="text-white text-xl">
                                    {stats.totalTrades}
                                </div>
                                <div className="text-white/60 text-xs">
                                    Total
                                </div>
                            </div>
                        </div>
                    )}

                    {bestTrade && (
                        <div
                            className={`mb-4 rounded-lg border p-3 ${Number(bestTrade.profitLossPercentage || 0) >= 0
                                ? "border-green-500/20 bg-green-500/10"
                                : "border-red-500/20 bg-red-500/10"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp
                                        className={`h-4 w-4 ${Number(
                                            bestTrade.profitLossPercentage ||
                                            0
                                        ) >= 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                            }`}
                                    />
                                    <span
                                        className={`text-sm ${Number(
                                            bestTrade.profitLossPercentage ||
                                            0
                                        ) >= 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                            }`}
                                    >
                                        Best trade
                                    </span>
                                </div>
                                <Badge
                                    className={`${Number(
                                        bestTrade.profitLossPercentage || 0
                                    ) >= 0
                                        ? "border-green-500/30 bg-green-500/20 text-green-400"
                                        : "border-red-500/30 bg-red-500/20 text-red-400"
                                        }`}
                                >
                                    {Number(
                                        bestTrade.profitLossPercentage || 0
                                    ) >= 0
                                        ? "+"
                                        : ""}
                                    {bestTrade.profitLossPercentage}%
                                </Badge>
                            </div>
                            <div className="mt-1 text-sm text-white/80">
                                {new Date(
                                    bestTrade.tradeDate
                                ).toLocaleDateString("en-US")}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between border-white/10 border-t pt-3">
                        <div className="flex items-center space-x-1">
                            <Button
                                className="text-white/60 hover:bg-white/10 hover:text-white"
                                disabled={isCapturing}
                                onClick={handleFlexCapture}
                                size="sm"
                                variant="ghost"
                            >
                                {isCapturing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center space-x-1">
                            <Button
                                className="text-white/60 hover:bg-white/10 hover:text-white"
                                onClick={onEdit}
                                size="sm"
                                variant="ghost"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                onClick={onDelete}
                                size="sm"
                                variant="ghost"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button asChild size="sm">
                                <Link href={PAGES.TRADING_JOURNAL(journal.id)}>
                                    <ExternalLink className="mr-1 h-4 w-4" />
                                    Open
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {showPreview && capturedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xs"
                    onClick={handleClosePreview}
                >
                    <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-gradient-to-br from-black/90 to-black/80 p-4 shadow-2xl">
                        <div className="mb-3">
                            <h3 className="mb-1 text-lg text-white">
                                Performance Preview
                            </h3>
                            <p className="text-white/60 text-xs">
                                Review your trading statistics before sharing
                            </p>
                        </div>

                        <div className="mb-4">
                            <Image
                                alt="Trading performance screenshot"
                                className="w-full rounded-xl border border-white/10 shadow-lg"
                                height={500}
                                src={capturedImage}
                                width={400}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-white/40">
                                {journal.name} •{" "}
                                {new Date().toLocaleDateString("fr-FR")}
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    className="rounded-xl border border-white/20 px-6 py-3 text-white/70 transition-all duration-200 hover:border-white/40 hover:bg-white/5 hover:text-white"
                                    onClick={handleClosePreview}
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="rounded-xl bg-white px-6 py-3 font-medium text-black shadow-lg transition-all duration-200 hover:bg-gray-100 hover:shadow-xl"
                                    onClick={handleDownload}
                                    type="button"
                                >
                                    Download Image
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
