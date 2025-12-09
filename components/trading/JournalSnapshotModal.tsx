"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { RouterOutput } from "@/orpc/client";
import { orpc } from "@/orpc/client";
import { useJournalSnapshot } from "./use-journal-snapshot";

interface JournalSnapshotModalProps {
    journalId: string;
    isOpen: boolean;
    onClose: () => void;
}

function getBestTrade(
    trades: RouterOutput["trading"]["getSnapshotData"]["trades"]
) {
    if (!trades || trades.length === 0) {
        return null;
    }

    return trades.reduce((best, current) => {
        const currentPnl = Number(current.profitLossPercentage || 0);
        const bestPnl = Number(best.profitLossPercentage || 0);
        return currentPnl > bestPnl ? current : best;
    });
}

function formatTradeDate(date?: Date | string | null) {
    if (!date) {
        return "-";
    }
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US");
}

export function JournalSnapshotModal({
    journalId,
    isOpen,
    onClose,
}: JournalSnapshotModalProps) {
    const { data, isLoading } = useQuery(
        orpc.trading.getSnapshotData.queryOptions({
            input: { id: journalId },
            enabled: !!journalId && isOpen,
        })
    );

    const journalName = data?.journal.name ?? "";
    const {
        captureRef,
        capturedImage,
        handleCapture,
        handleClosePreview,
        handleDownload,
        isCapturing,
        showPreview,
    } = useJournalSnapshot({ journalName });

    const bestTrade = useMemo(
        () => (data?.trades ? getBestTrade(data.trades) : null),
        [data?.trades]
    );

    const bestTradeColor = useMemo(() => {
        if (!bestTrade) {
            return "#f87171";
        }
        return Number(bestTrade.profitLossPercentage) >= 0
            ? "#4ade80"
            : "#f87171";
    }, [bestTrade]);

    const handleClose = () => {
        if (isLoading || isCapturing) {
            return;
        }
        onClose();
    };

    return (
        <>
            <Dialog
                onOpenChange={(open) => !open && handleClose()}
                open={isOpen}
            >
                <DialogContent
                    className="max-w-lg border-white/20 bg-black/90"
                    overlayClassName="bg-black/90 backdrop-blur-xs"
                >
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Journal Snapshot
                        </DialogTitle>
                    </DialogHeader>

                    {isLoading && (
                        <div className="flex min-h-[400px] items-center justify-center">
                            <div className="text-white/60">
                                Loading snapshot data...
                            </div>
                        </div>
                    )}
                    {!isLoading && data && (
                        <div className="space-y-4">
                            <div
                                ref={captureRef}
                                style={{
                                    width: "100%",
                                    borderRadius: "0.75rem",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                                    padding: "1rem",
                                }}
                            >
                                <div style={{ marginBottom: "0.5rem" }}>
                                    <div
                                        style={{
                                            fontWeight: "600",
                                            fontSize: "1.125rem",
                                            lineHeight: "1.75rem",
                                            color: "#ffffff",
                                        }}
                                    >
                                        {data.journal.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "0.875rem",
                                            lineHeight: "1.25rem",
                                            color: "rgba(255, 255, 255, 0.6)",
                                        }}
                                    >
                                        Trading Performance
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)",
                                        gap: "0.75rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            borderRadius: "0.25rem",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            backgroundColor:
                                                "rgba(255, 255, 255, 0.05)",
                                            padding: "0.75rem",
                                            textAlign: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontWeight: "600",
                                                fontSize: "1.25rem",
                                                lineHeight: "1.75rem",
                                                color:
                                                    Number(
                                                        data.stats?.totalPnL ??
                                                            0
                                                    ) >= 0
                                                        ? "#4ade80"
                                                        : "#f87171",
                                            }}
                                        >
                                            {Number(
                                                data.stats?.totalPnL ?? 0
                                            ) >= 0
                                                ? "+"
                                                : ""}
                                            {Number(
                                                data.stats?.totalPnL ?? 0
                                            ).toFixed(2)}
                                            %
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                lineHeight: "1rem",
                                                color: "rgba(255, 255, 255, 0.6)",
                                            }}
                                        >
                                            Performance
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            borderRadius: "0.25rem",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            backgroundColor:
                                                "rgba(255, 255, 255, 0.05)",
                                            padding: "0.75rem",
                                            textAlign: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "1.25rem",
                                                lineHeight: "1.75rem",
                                                color: "#ffffff",
                                            }}
                                        >
                                            {data.stats?.totalTrades ?? 0}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                lineHeight: "1rem",
                                                color: "rgba(255, 255, 255, 0.6)",
                                            }}
                                        >
                                            Trades
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            borderRadius: "0.25rem",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            backgroundColor:
                                                "rgba(255, 255, 255, 0.05)",
                                            padding: "0.75rem",
                                            textAlign: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "1.25rem",
                                                lineHeight: "1.75rem",
                                                color: "#ffffff",
                                            }}
                                        >
                                            {Number(
                                                data.stats?.winRate ?? 0
                                            ).toFixed(1)}
                                            %
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                lineHeight: "1rem",
                                                color: "rgba(255, 255, 255, 0.6)",
                                            }}
                                        >
                                            Win rate
                                        </div>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        marginTop: "0.75rem",
                                        borderRadius: "0.25rem",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.05)",
                                        padding: "0.75rem",
                                        textAlign: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "0.75rem",
                                            lineHeight: "1rem",
                                            color: "rgba(255, 255, 255, 0.8)",
                                        }}
                                    >
                                        Best trade
                                    </div>
                                    <div
                                        style={{
                                            fontWeight: "600",
                                            fontSize: "1.125rem",
                                            lineHeight: "1.75rem",
                                            color: bestTradeColor,
                                        }}
                                    >
                                        {bestTrade ? (
                                            <>
                                                {Number(
                                                    bestTrade.profitLossPercentage
                                                ) >= 0
                                                    ? "+"
                                                    : ""}
                                                {bestTrade.profitLossPercentage}
                                                %
                                                <span
                                                    style={{
                                                        marginLeft: "0.25rem",
                                                        fontSize: "0.75rem",
                                                        lineHeight: "1rem",
                                                        color: "rgba(255, 255, 255, 0.6)",
                                                    }}
                                                >
                                                    {formatTradeDate(
                                                        bestTrade.tradeDate
                                                    )}
                                                </span>
                                            </>
                                        ) : (
                                            "-"
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    className="rounded-xl border border-white/20 px-6 py-3 text-white/70 transition-all duration-200 hover:border-white/40 hover:bg-white/5 hover:text-white"
                                    onClick={handleClose}
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="rounded-xl bg-white px-6 py-3 font-medium text-black shadow-lg transition-all duration-200 hover:bg-gray-100 hover:shadow-xl"
                                    onClick={handleCapture}
                                    type="button"
                                >
                                    {isCapturing
                                        ? "Capturing..."
                                        : "Capture Snapshot"}
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {showPreview && capturedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-linear-to-br from-black/90 to-black/80 p-4 shadow-2xl">
                        <div className="mb-3">
                            <h3 className="mb-1 text-lg text-white">
                                Performance Preview
                            </h3>
                            <p className="text-white/60 text-xs">
                                Review your trading statistics before sharing
                            </p>
                        </div>

                        <div className="mb-4 overflow-hidden rounded-xl border border-white/10 shadow-lg">
                            <Image
                                alt="Trading performance screenshot"
                                className="h-auto w-full"
                                height={500}
                                src={capturedImage}
                                unoptimized
                                width={400}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-white/40">
                                {journalName} •{" "}
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
                                    {isCapturing ? "Preparing..." : "Download"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
