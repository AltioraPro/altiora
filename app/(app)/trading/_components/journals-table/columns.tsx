import {
    RiCameraLine,
    RiDeleteBinLine,
    RiEditLine,
    RiMore2Fill,
} from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { JournalSnapshotModal } from "@/components/trading/JournalSnapshotModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PAGES } from "@/constants/pages";
import type { RouterOutput } from "@/orpc/client";
import { orpc } from "@/orpc/client";
import type { TradingJournal } from "@/server/db/schema";
import { useEditJournalStore } from "@/store/edit-journal-store";

export interface JournalRowData {
    journal: TradingJournal;
    stats: RouterOutput["trading"]["getStats"] | null;
    trades: RouterOutput["trading"]["getTrades"];
}

function getBestTrade(trades: JournalRowData["trades"]) {
    if (!trades || trades.length === 0) {
        return null;
    }

    return trades.reduce((best, current) => {
        const currentPnl = Number(current.profitLossPercentage || 0);
        const bestPnl = Number(best.profitLossPercentage || 0);
        return currentPnl > bestPnl ? current : best;
    });
}

function formatTradeDate(date?: string | null) {
    if (!date) {
        return "-";
    }
    return new Date(date).toLocaleDateString("en-US");
}

function JournalActionsCell({ row }: { row: { original: JournalRowData } }) {
    const { journal } = row.original;
    const { open: openEditModal } = useEditJournalStore();
    const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);

    const { mutateAsync: deleteJournal, isPending: isDeleting } = useMutation(
        orpc.trading.deleteJournal.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getJournals.queryKey({ input: {} }),
                    orpc.trading.getJournalsTableData.queryKey({
                        input: {},
                    }),
                    orpc.trading.getStats.queryKey({
                        input: { journalId: journal.id },
                    }),
                    orpc.trading.getTrades.queryKey({
                        input: { journalId: journal.id },
                    }),
                ],
            },
        })
    );

    const handleDelete = async () => {
        await deleteJournal({ id: journal.id });
    };

    return (
        <>
            <div className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            aria-label="Open journal actions"
                            className="text-white/80"
                            size="icon"
                            variant="ghost"
                        >
                            <RiMore2Fill className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="space-x-2"
                            onClick={() => setIsSnapshotModalOpen(true)}
                        >
                            <RiCameraLine className="size-4" />
                            <span>Snapshot</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="space-x-2"
                            onClick={() =>
                                openEditModal({
                                    id: journal.id,
                                    name: journal.name,
                                    description: journal.description || "",
                                })
                            }
                        >
                            <RiEditLine className="size-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="space-x-2 text-red-400 focus:text-red-300"
                            disabled={isDeleting}
                            onClick={handleDelete}
                        >
                            <RiDeleteBinLine className="size-4" />
                            <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <JournalSnapshotModal
                isOpen={isSnapshotModalOpen}
                journalId={journal.id}
                onClose={() => setIsSnapshotModalOpen(false)}
            />
        </>
    );
}

export const createColumns = (): ColumnDef<JournalRowData>[] => [
    {
        header: "Name",
        accessorKey: "name",
        accessorFn: (row) => row.journal.name,
        cell: ({ row }) => {
            const { journal } = row.original;
            return (
                <div className="max-w-[220px] space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                            {journal.name}
                        </span>
                        <Badge
                            className="bg-white/10 text-white/80 text-xs"
                            variant="secondary"
                        >
                            {journal.startingCapital
                                ? `${journal.startingCapital}€`
                                : "Journal"}
                        </Badge>
                    </div>
                    <div className="line-clamp-2 text-sm text-white/60">
                        {journal.description || "No description"}
                    </div>
                </div>
            );
        },
        size: 220,
    },
    {
        header: "Performance",
        accessorKey: "totalPnL",
        accessorFn: (row) => Number(row.stats?.totalPnL ?? 0),
        cell: ({ row }) => {
            const totalPnL = Number(row.original.stats?.totalPnL ?? 0);
            return (
                <span
                    className={
                        totalPnL >= 0 ? "text-green-400" : "text-red-400"
                    }
                >
                    {totalPnL >= 0 ? "+" : ""}
                    {totalPnL.toFixed(2)}%
                </span>
            );
        },
        size: 120,
    },
    {
        header: "Win rate",
        accessorKey: "winRate",
        accessorFn: (row) => Number(row.stats?.winRate ?? 0),
        cell: ({ row }) => {
            const winRate = Number(row.original.stats?.winRate ?? 0);
            return <span>{winRate.toFixed(1)}%</span>;
        },
        size: 100,
    },
    {
        header: "Trades",
        accessorKey: "totalTrades",
        accessorFn: (row) => row.stats?.totalTrades ?? 0,
        cell: ({ row }) => {
            const totalTrades = row.original.stats?.totalTrades ?? 0;
            return <span>{totalTrades}</span>;
        },
        size: 100,
    },
    {
        header: "Best trade",
        accessorKey: "bestTrade",
        cell: ({ row }) => {
            const bestTrade = useMemo(
                () => getBestTrade(row.original.trades),
                [row.original.trades]
            );
            return bestTrade ? (
                <div className="flex flex-col">
                    <span
                        className={
                            Number(bestTrade.profitLossPercentage) >= 0
                                ? "text-green-400"
                                : "text-red-400"
                        }
                    >
                        {Number(bestTrade.profitLossPercentage) >= 0 ? "+" : ""}
                        {bestTrade.profitLossPercentage}%
                    </span>
                    <span className="text-white/60 text-xs">
                        {formatTradeDate(bestTrade.tradeDate.toISOString())}
                    </span>
                </div>
            ) : (
                <span className="text-white/50">-</span>
            );
        },
        size: 150,
        enableSorting: false,
    },
    {
        id: "viewJournal",
        header: () => null,
        cell: ({ row }) => {
            const { journal } = row.original;
            return (
                <Link href={PAGES.TRADING_JOURNAL(journal.id)}>
                    View Journal
                </Link>
            );
        },
        size: 80,
        enableSorting: false,
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <JournalActionsCell row={row} />,
        size: 100,
        enableSorting: false,
    },
];
