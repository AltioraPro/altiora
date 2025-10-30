"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Edit,
    ExternalLink,
    Trash2,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/trpc/client";
import { EditTradeModal } from "./EditTradeModal";

interface TradesTableProps {
    journalId: string;
}

export function TradesTable({ journalId }: TradesTableProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedTrades, setSelectedTrades] = useState<Set<string>>(
        new Set()
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingTradeId, setEditingTradeId] = useState<string | null>(null);

    const itemsPerPage = 10;
    const offset = currentPage * itemsPerPage;

    const { data: trades, isLoading } = api.trading.getTrades.useQuery({
        journalId,
        limit: itemsPerPage,
        offset,
    });

    const { data: stats } = api.trading.getStats.useQuery({ journalId });
    const { data: assets } = api.trading.getAssets.useQuery({ journalId });
    const { data: sessions } = api.trading.getSessions.useQuery({ journalId });
    const { data: setups } = api.trading.getSetups.useQuery({ journalId });

    const utils = api.useUtils();
    const deleteTradeMutation = api.trading.deleteTrade.useMutation({
        onSuccess: () => {
            utils.trading.getTrades.invalidate();
            utils.trading.getStats.invalidate();
        },
    });

    const deleteMultipleTradesMutation =
        api.trading.deleteMultipleTrades.useMutation({
            onSuccess: () => {
                utils.trading.getTrades.invalidate();
                utils.trading.getStats.invalidate();
                setSelectedTrades(new Set());
            },
        });

    const totalTrades = stats?.totalTrades || 0;
    const totalPages = Math.ceil(totalTrades / itemsPerPage);

    const handleSelectTrade = (tradeId: string) => {
        const newSelected = new Set(selectedTrades);
        if (newSelected.has(tradeId)) {
            newSelected.delete(tradeId);
        } else {
            newSelected.add(tradeId);
        }
        setSelectedTrades(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedTrades.size === trades?.length) {
            setSelectedTrades(new Set());
        } else {
            const allTradeIds = new Set(trades?.map((trade) => trade.id) || []);
            setSelectedTrades(allTradeIds);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedTrades.size === 0) return;

        setIsDeleting(true);
        try {
            await deleteMultipleTradesMutation.mutateAsync({
                tradeIds: Array.from(selectedTrades),
            });
        } catch (error) {
            console.error("Error deleting trades:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteSingle = async (tradeId: string) => {
        try {
            await deleteTradeMutation.mutateAsync({ id: tradeId });
        } catch (error) {
            console.error("Error deleting trade:", error);
        }
    };

    const handleEditTrade = (tradeId: string) => {
        setEditingTradeId(tradeId);
    };

    const getExitReasonBadge = (exitReason: string | null) => {
        switch (exitReason) {
            case "TP":
                return (
                    <Badge className="border-green-500/30 bg-green-500/20 text-green-400">
                        TP
                    </Badge>
                );
            case "BE":
                return (
                    <Badge className="border-blue-500/30 bg-blue-500/20 text-blue-400">
                        BE
                    </Badge>
                );
            case "SL":
                return (
                    <Badge className="border-red-500/30 bg-red-500/20 text-red-400">
                        SL
                    </Badge>
                );
            case "Manual":
                return (
                    <Badge className="border-gray-500/30 bg-gray-500/20 text-gray-400">
                        Manual
                    </Badge>
                );
            default:
                return (
                    <Badge className="border-gray-500/30 bg-gray-500/20 text-gray-400">
                        -
                    </Badge>
                );
        }
    };

    if (isLoading) {
        return (
            <Card className="border border-white/10 bg-black/20">
                <CardHeader>
                    <CardTitle className="text-white">Trades</CardTitle>
                    <CardDescription className="text-white/60">
                        Loading trades...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-white border-b-2" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="border border-white/10 bg-black/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Trades</CardTitle>
                            <CardDescription className="text-white/60">
                                {totalTrades} trades total • Page{" "}
                                {currentPage + 1} of {totalPages}
                            </CardDescription>
                        </div>
                        {selectedTrades.size > 0 && (
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-white/60">
                                    {selectedTrades.size} selected
                                </span>
                                <Button
                                    className="border-red-500/30 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    disabled={isDeleting}
                                    onClick={handleDeleteSelected}
                                    size="sm"
                                    variant="destructive"
                                >
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    Delete Selected
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {trades && trades.length > 0 ? (
                        <div className="space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-white/10 border-b">
                                            <th className="px-4 py-3 text-left">
                                                <Checkbox
                                                    checked={
                                                        selectedTrades.size ===
                                                            trades.length &&
                                                        trades.length > 0
                                                    }
                                                    className="border-white/30"
                                                    onCheckedChange={
                                                        handleSelectAll
                                                    }
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm text-white/60">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm text-white/60">
                                                Asset
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm text-white/60">
                                                Session
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm text-white/60">
                                                Setup
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm text-white/60">
                                                Risk
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm text-white/60">
                                                Result
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm text-white/60">
                                                Exit
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm text-white/60">
                                                Notes
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm text-white/60">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trades.map((trade) => (
                                            <tr
                                                className="border-white/5 border-b transition-colors hover:bg-white/5"
                                                key={trade.id}
                                            >
                                                <td className="px-4 py-3">
                                                    <Checkbox
                                                        checked={selectedTrades.has(
                                                            trade.id
                                                        )}
                                                        className="border-white/30"
                                                        onCheckedChange={() =>
                                                            handleSelectTrade(
                                                                trade.id
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-white">
                                                    {format(
                                                        new Date(
                                                            trade.tradeDate
                                                        ),
                                                        "dd MMM yyyy",
                                                        { locale: enUS }
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-white">
                                                    {assets?.find(
                                                        (a) =>
                                                            a.id ===
                                                            trade.assetId
                                                    )?.name ||
                                                        trade.symbol ||
                                                        "-"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-white">
                                                    {sessions?.find(
                                                        (s) =>
                                                            s.id ===
                                                            trade.sessionId
                                                    )?.name || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-white">
                                                    {setups?.find(
                                                        (s) =>
                                                            s.id ===
                                                            trade.setupId
                                                    )?.name || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-white">
                                                    {trade.riskInput || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="space-y-1">
                                                        <span
                                                            className={`${Number(trade.profitLossPercentage || 0) > 0 ? "text-green-400" : Number(trade.profitLossPercentage || 0) < 0 ? "text-red-400" : "text-blue-400"}`}
                                                        >
                                                            {Number(
                                                                trade.profitLossPercentage ||
                                                                    0
                                                            ) >= 0
                                                                ? "+"
                                                                : ""}
                                                            {trade.profitLossPercentage ||
                                                                0}
                                                            %
                                                        </span>
                                                        {trade.profitLossAmount &&
                                                            stats?.journal
                                                                ?.usePercentageCalculation && (
                                                                <div
                                                                    className={`text-xs ${Number(trade.profitLossAmount || 0) > 0 ? "text-green-400" : Number(trade.profitLossAmount || 0) < 0 ? "text-red-400" : "text-blue-400"}`}
                                                                >
                                                                    {Number(
                                                                        trade.profitLossAmount ||
                                                                            0
                                                                    ) >= 0
                                                                        ? "+"
                                                                        : ""}
                                                                    {
                                                                        trade.profitLossAmount
                                                                    }
                                                                    €
                                                                </div>
                                                            )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {getExitReasonBadge(
                                                        trade.exitReason
                                                    )}
                                                </td>
                                                <td className="max-w-[150px] px-4 py-3 text-sm text-white/70">
                                                    {trade.notes ? (
                                                        <div
                                                            className="truncate"
                                                            title={trade.notes}
                                                        >
                                                            {trade.notes
                                                                .length > 30
                                                                ? `${trade.notes.substring(0, 30)}...`
                                                                : trade.notes}
                                                        </div>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex items-center space-x-1">
                                                        <Button
                                                            className="h-8 w-8 p-1 text-white/60 hover:bg-white/10 hover:text-white"
                                                            onClick={() =>
                                                                handleEditTrade(
                                                                    trade.id
                                                                )
                                                            }
                                                            size="sm"
                                                            variant="ghost"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            className="h-8 w-8 p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                            onClick={() =>
                                                                handleDeleteSingle(
                                                                    trade.id
                                                                )
                                                            }
                                                            size="sm"
                                                            variant="ghost"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                        {trade.tradingviewLink && (
                                                            <a
                                                                href={
                                                                    trade.tradingviewLink
                                                                }
                                                                rel="noopener noreferrer"
                                                                target="_blank"
                                                            >
                                                                <Button
                                                                    className="h-8 w-8 p-1 text-white/60 hover:bg-white/10 hover:text-white"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Button>
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-4">
                                    <div className="text-sm text-white/60">
                                        Showing {offset + 1} to{" "}
                                        {Math.min(
                                            offset + itemsPerPage,
                                            totalTrades
                                        )}{" "}
                                        of {totalTrades} trades
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            className="border-white/20 bg-transparent text-white hover:bg-white/10"
                                            disabled={currentPage === 0}
                                            onClick={() =>
                                                setCurrentPage(
                                                    Math.max(0, currentPage - 1)
                                                )
                                            }
                                            size="sm"
                                            variant="outline"
                                        >
                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                            Previous
                                        </Button>
                                        <div className="flex items-center space-x-1">
                                            {Array.from(
                                                {
                                                    length: Math.min(
                                                        5,
                                                        totalPages
                                                    ),
                                                },
                                                (_, i) => {
                                                    const pageNum =
                                                        Math.max(
                                                            0,
                                                            Math.min(
                                                                totalPages - 5,
                                                                currentPage - 2
                                                            )
                                                        ) + i;
                                                    return (
                                                        <Button
                                                            className={
                                                                currentPage ===
                                                                pageNum
                                                                    ? "bg-white text-black hover:bg-gray-200"
                                                                    : "border-white/20 bg-transparent text-white hover:bg-white/10"
                                                            }
                                                            key={pageNum}
                                                            onClick={() =>
                                                                setCurrentPage(
                                                                    pageNum
                                                                )
                                                            }
                                                            size="sm"
                                                            variant={
                                                                currentPage ===
                                                                pageNum
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                        >
                                                            {pageNum + 1}
                                                        </Button>
                                                    );
                                                }
                                            )}
                                        </div>
                                        <Button
                                            className="border-white/20 bg-transparent text-white hover:bg-white/10"
                                            disabled={
                                                currentPage >= totalPages - 1
                                            }
                                            onClick={() =>
                                                setCurrentPage(
                                                    Math.min(
                                                        totalPages - 1,
                                                        currentPage + 1
                                                    )
                                                )
                                            }
                                            size="sm"
                                            variant="outline"
                                        >
                                            Next
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-white/40" />
                            <p className="text-white/60">No trades found</p>
                            <p className="text-sm text-white/40">
                                Start by creating your first trade
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {editingTradeId && (
                <EditTradeModal
                    isOpen={!!editingTradeId}
                    onClose={() => setEditingTradeId(null)}
                    onSuccess={() => {
                        setEditingTradeId(null);
                        utils.trading.getTrades.invalidate();
                        utils.trading.getStats.invalidate();
                    }}
                    tradeId={editingTradeId}
                />
            )}
        </>
    );
}
