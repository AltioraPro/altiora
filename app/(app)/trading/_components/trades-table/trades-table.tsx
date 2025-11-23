"use client";

import { RiAlertLine, RiBrush2Line } from "@remixicon/react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    handleSortingChange,
    queryParamsToSortingState,
} from "@/lib/table/sorting-state";
import { orpc } from "@/orpc/client";
import { EditTradeModal } from "../../../../../components/trading/EditTradeModal";
import { createColumns, type TradeItem } from "./columns";
import TablePagination from "./pagination";
import { type SortableColumn, tradesTableParsers } from "./search-params";

interface TradesTableProps {
    journalId: string;
}

export function TradesTable({ journalId }: TradesTableProps) {
    const [editingTradeId, setEditingTradeId] = useState<string | null>(null);

    const [{ page, limit, sortBy, sortOrder }, setQueryStates] =
        useQueryStates(tradesTableParsers);

    const setSortBy = (value: SortableColumn | null) => {
        setQueryStates({ sortBy: value });
    };

    const setSortOrder = (value: "asc" | "desc" | null) => {
        setQueryStates({ sortOrder: value });
    };

    const setPage = (value: number | null) => {
        setQueryStates({ page: value });
    };

    const setLimit = (value: number | null) => {
        setQueryStates({ limit: value });
    };

    const offset = (page - 1) * limit;

    const { data: trades, isLoading } = useQuery(
        orpc.trading.getTrades.queryOptions({
            input: { journalId, limit, offset },
            placeholderData: keepPreviousData,
        })
    );

    const { data: stats } = useQuery(
        orpc.trading.getStats.queryOptions({ input: { journalId } })
    );
    const { data: assets } = useQuery(
        orpc.trading.getAssets.queryOptions({ input: { journalId } })
    );
    const { data: sessions } = useQuery(
        orpc.trading.getSessions.queryOptions({ input: { journalId } })
    );
    const { data: confirmations } = useQuery(
        orpc.trading.getConfirmations.queryOptions({ input: { journalId } })
    );

    const { mutateAsync: deleteMultipleTrades, isPending: isDeleting } =
        useMutation(
            orpc.trading.deleteMultipleTrades.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.trading.getTrades.queryKey({
                            input: { journalId },
                        }),
                        orpc.trading.getStats.queryKey({
                            input: { journalId },
                        }),
                    ],
                },
            })
        );

    const totalTrades = stats?.totalTrades || 0;
    const totalPages = Math.ceil(totalTrades / limit);

    const data = useMemo(() => (trades ?? []) as TradeItem[], [trades]);

    const columns = useMemo(
        () =>
            createColumns({
                assets,
                sessions,
                confirmations,
                stats,
                journalId,
                onEdit: (tradeId: string) => {
                    setEditingTradeId(tradeId);
                },
            }),
        [assets, sessions, confirmations, stats, journalId]
    );

    const table = useReactTable<TradeItem>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        enableRowSelection: true,
        onSortingChange: (updaterOrValue) => {
            handleSortingChange<SortableColumn>({
                updaterOrValue,
                currentSorting: queryParamsToSortingState(sortBy, sortOrder),
                setSortBy,
                setSortOrder,
                setPage,
                currentPage: page,
            });
        },
        state: {
            sorting: queryParamsToSortingState(sortBy, sortOrder),
        },
    });

    const handleDeleteSelected = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length === 0) {
            return;
        }

        const tradeIds = selectedRows.map(
            (row) => row.original.advanced_trade.id
        );
        await deleteMultipleTrades({ tradeIds });
        table.resetRowSelection();
    };

    const paginationData = useMemo(
        () => ({
            total: totalTrades,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        }),
        [totalTrades, totalPages, page]
    );

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
                                {totalTrades} trades total • Page {page} of{" "}
                                {totalPages || 1}
                            </CardDescription>
                        </div>
                        {table.getSelectedRowModel().rows.length > 0 && (
                            <ButtonGroup className="ml-auto">
                                <ButtonGroupText>
                                    <Label>
                                        {
                                            table.getSelectedRowModel().rows
                                                .length
                                        }{" "}
                                        selected
                                    </Label>
                                </ButtonGroupText>
                                <Button
                                    className="border-red-500/30 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    disabled={isDeleting}
                                    onClick={handleDeleteSelected}
                                    size="sm"
                                    variant="destructive"
                                >
                                    <RiBrush2Line
                                        aria-hidden="true"
                                        className="-ms-1 opacity-60"
                                        size={16}
                                    />
                                    Delete Selected
                                </Button>
                            </ButtonGroup>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {data.length > 0 ? (
                        <div className="space-y-4">
                            <div className="overflow-hidden rounded-md border border-white/10">
                                <Table className="table-fixed">
                                    <TableHeader>
                                        {table
                                            .getHeaderGroups()
                                            .map((headerGroup) => (
                                                <TableRow
                                                    className="border-white/10 hover:bg-transparent"
                                                    key={headerGroup.id}
                                                >
                                                    {headerGroup.headers.map(
                                                        (header) => (
                                                            <TableHead
                                                                className="h-11 text-white/60"
                                                                key={header.id}
                                                                style={{
                                                                    width: `${header.getSize()}px`,
                                                                }}
                                                            >
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                          header
                                                                              .column
                                                                              .columnDef
                                                                              .header,
                                                                          header.getContext()
                                                                      )}
                                                            </TableHead>
                                                        )
                                                    )}
                                                </TableRow>
                                            ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows?.length ? (
                                            table
                                                .getRowModel()
                                                .rows.map((row) => (
                                                    <TableRow
                                                        className="border-white/5 transition-colors hover:bg-white/5"
                                                        data-state={
                                                            row.getIsSelected() &&
                                                            "selected"
                                                        }
                                                        key={row.id}
                                                    >
                                                        {row
                                                            .getVisibleCells()
                                                            .map((cell) => (
                                                                <TableCell
                                                                    className="text-white"
                                                                    key={
                                                                        cell.id
                                                                    }
                                                                >
                                                                    {flexRender(
                                                                        cell
                                                                            .column
                                                                            .columnDef
                                                                            .cell,
                                                                        cell.getContext()
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                    </TableRow>
                                                ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    className="h-24 text-center text-white/60"
                                                    colSpan={columns.length}
                                                >
                                                    No trades found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <TablePagination
                                    itemName="trades"
                                    limit={limit}
                                    onLimitChange={setLimit}
                                    onPageChange={setPage}
                                    page={page}
                                    pagination={paginationData}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <RiAlertLine className="mx-auto mb-4 h-12 w-12 text-white/40" />
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
                    }}
                    tradeId={editingTradeId}
                />
            )}
        </>
    );
}
