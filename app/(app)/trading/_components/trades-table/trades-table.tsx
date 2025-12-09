"use client";

import { RiAlertLine, RiBrush2Line } from "@remixicon/react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useQueryState, useQueryStates } from "nuqs";
import { useMemo, useState } from "react";
import { EditTradeModal } from "@/components/trading/EditTradeModal";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { tradingJournalSearchParams } from "../../journals/[id]/search-params";
import { createColumns, type TradeItem } from "./columns";
import TablePagination from "./pagination";
import { type SortableColumn, tradesTableParsers } from "./search-params";

// Regex for YYYY-MM-DD date format validation
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface TradesTableProps {
    journalId: string;
}

export function TradesTable({ journalId }: TradesTableProps) {
    const [editTrade, setEditTrade] = useState<TradeItem | null>(null);

    const closeEditTrade = () => {
        setEditTrade(null);
    };

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

    const [dateRange] = useQueryState(
        "dateRange",
        tradingJournalSearchParams.dateRange
    );
    const [sessionsFilter] = useQueryState(
        "sessions",
        tradingJournalSearchParams.sessions
    );
    const [confirmationsFilter] = useQueryState(
        "confirmations",
        tradingJournalSearchParams.confirmations
    );
    const [assetsFilter] = useQueryState(
        "assets",
        tradingJournalSearchParams.assets
    );

    const advancedFilters = useMemo(
        () => ({
            sessions: sessionsFilter ?? [],
            confirmations: confirmationsFilter ?? [],
            assets: assetsFilter ?? [],
        }),
        [sessionsFilter, confirmationsFilter, assetsFilter]
    );

    const offset = (page - 1) * limit;

    // Format date strings to YYYY-MM-DD format required by Zod schema
    const formattedDates = useMemo(() => {
        const formatDateString = (
            dateStr: string | null | undefined
        ): string | undefined => {
            if (!dateStr) {
                return;
            }
            try {
                // Parse ISO date string and extract YYYY-MM-DD part
                const date = new Date(dateStr);
                return date.toISOString().split("T")[0];
            } catch {
                // If already in YYYY-MM-DD format, return as is
                if (DATE_FORMAT_REGEX.test(dateStr)) {
                    return dateStr;
                }
                return;
            }
        };

        return {
            startDate: formatDateString(dateRange?.from),
            endDate: formatDateString(dateRange?.to),
        };
    }, [dateRange]);

    const tradeFilters = useMemo(() => {
        const sessionIds =
            advancedFilters.sessions.length > 0
                ? advancedFilters.sessions
                : undefined;
        const confirmationIds =
            advancedFilters.confirmations.length > 0
                ? advancedFilters.confirmations
                : undefined;
        const assetIds =
            advancedFilters.assets.length > 0 ? advancedFilters.assets : undefined;

        return {
            sessionIds,
            confirmationIds,
            assetIds,
        };
    }, [advancedFilters]);

    const { data: trades, isLoading } = useQuery(
        orpc.trading.getTrades.queryOptions({
            input: {
                journalId,
                limit,
                offset,
                startDate: formattedDates.startDate,
                endDate: formattedDates.endDate,
                sessionIds: tradeFilters.sessionIds,
                confirmationIds: tradeFilters.confirmationIds,
                assetIds: tradeFilters.assetIds,
            },
            placeholderData: keepPreviousData,
        })
    );

    const { data: stats } = useQuery(
        orpc.trading.getStats.queryOptions({
            input: {
                journalId,
                startDate: formattedDates.startDate,
                endDate: formattedDates.endDate,
                sessionIds: tradeFilters.sessionIds,
                confirmationIds: tradeFilters.confirmationIds,
                assetIds: tradeFilters.assetIds,
            },
        })
    );
    const { data: assets } = useQuery(
        orpc.trading.getAssets.queryOptions({
            input: {
                journalId,
            },
        })
    );
    const { data: sessions } = useQuery(
        orpc.trading.getSessions.queryOptions({
            input: {
                journalId,
            },
        })
    );

    const { mutateAsync: deleteMultipleTrades, isPending: isDeleting } =
        useMutation(
            orpc.trading.deleteMultipleTrades.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.trading.getTrades.queryKey({
                            input: {
                                journalId,
                                limit,
                                offset,
                                startDate: formattedDates.startDate,
                                endDate: formattedDates.endDate,
                                sessionIds: tradeFilters.sessionIds,
                                confirmationIds: tradeFilters.confirmationIds,
                                assetIds: tradeFilters.assetIds,
                            },
                        }),
                        orpc.trading.getStats.queryKey({
                            input: {
                                journalId,
                                startDate: formattedDates.startDate,
                                endDate: formattedDates.endDate,
                                sessionIds: tradeFilters.sessionIds,
                                confirmationIds: tradeFilters.confirmationIds,
                                assetIds: tradeFilters.assetIds,
                            },
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
                stats,
                journalId,
                onEdit: (trade: TradeItem) => {
                    setEditTrade(trade);
                },
            }),
        [assets, sessions, stats, journalId]
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

        const tradeIds = selectedRows.map((row) => row.original.id);
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
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex flex-col items-start justify-between">
                        <Skeleton className="mb-2 h-8 w-32 rounded bg-white/10" />
                        <Skeleton className="h-4 w-48 rounded bg-white/10" />
                    </div>
                </div>
                <div>
                    <div className="space-y-4">
                        <Table className="table-fixed border border-neutral-800">
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <TableHead
                                            className="h-11 text-white/60"
                                            key={i}
                                        >
                                            <Skeleton className="h-4 w-20 rounded bg-white/10" />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow
                                        className="border-white/5"
                                        key={i}
                                    >
                                        {Array.from({ length: 8 }).map(
                                            (_, j) => (
                                                <TableCell
                                                    className="text-white"
                                                    key={j}
                                                >
                                                    <Skeleton className="h-4 w-full rounded bg-white/10" />
                                                </TableCell>
                                            )
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex flex-col items-start justify-between">
                    <h2 className="font-bold text-2xl text-white">Trades</h2>
                    <p className="text-sm text-white/60">
                        {totalTrades} trades total • Page {page} of{" "}
                        {totalPages || 1}
                    </p>
                </div>
                {table.getSelectedRowModel().rows.length > 0 && (
                    <ButtonGroup className="ml-auto">
                        <ButtonGroupText>
                            <Label>
                                {table.getSelectedRowModel().rows.length}{" "}
                                selectedu
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
            <div>
                {data.length > 0 ? (
                    <div className="space-y-4">
                        <Table className="table-fixed border border-neutral-800">
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow
                                        className="border-white/10 hover:bg-transparent"
                                        key={headerGroup.id}
                                    >
                                        {headerGroup.headers.map((header) => (
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
                                                        header.column
                                                            .columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
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
                                                        key={cell.id}
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
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
            </div>

            <EditTradeModal onClose={closeEditTrade} trade={editTrade} />
        </div>
    );
}
