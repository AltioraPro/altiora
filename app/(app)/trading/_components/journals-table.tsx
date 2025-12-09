"use client";

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { orpc } from "@/orpc/client";
import { createColumns, type JournalRowData } from "./journals-table/columns";

export function JournalsTable() {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(8);

    const { data, isLoading } = useQuery(
        orpc.trading.getJournalsTableData.queryOptions({
            input: { page: pageIndex, pageSize },
        })
    );

    const journalData = data?.data ?? [];
    const totalCount = data?.totalCount ?? 0;

    const tableData = useMemo<JournalRowData[]>(
        () =>
            journalData.map((item) => ({
                journal: item.journal,
                stats: item.stats,
                trades: item.trades,
            })),
        [journalData]
    );

    const columns = useMemo(() => createColumns(), []);

    const table = useReactTable<JournalRowData>({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        pageCount: Math.ceil(totalCount / pageSize),
        state: {
            pagination: {
                pageIndex,
                pageSize,
            },
        },
        initialState: {
            sorting: [{ id: "totalPnL", desc: true }],
        },
        onPaginationChange: (updater) => {
            const newPagination =
                typeof updater === "function"
                    ? updater({ pageIndex, pageSize })
                    : updater;
            setPageIndex(newPagination.pageIndex);
        },
    });

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex flex-col items-start justify-between">
                    <h2 className="font-bold text-2xl text-white">
                        Trading journals
                    </h2>
                    <p className="text-sm text-white/60">
                        {totalCount} journals total • Page {pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </p>
                </div>
            </div>
            <div>
                {isLoading && (
                    <div className="py-8 text-center">
                        <p className="text-white/60">Loading journals...</p>
                    </div>
                )}
                {!isLoading && tableData.length > 0 && (
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
                                                onClick={
                                                    header.column.getCanSort()
                                                        ? header.column.getToggleSortingHandler()
                                                        : undefined
                                                }
                                                style={{
                                                    cursor: header.column.getCanSort()
                                                        ? "pointer"
                                                        : "default",
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
                                            No journals found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {table.getPageCount() > 1 && (
                            <div className="flex items-center justify-between pt-2">
                                <div className="text-sm text-white/60">
                                    Page {pageIndex + 1} /{" "}
                                    {table.getPageCount()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        disabled={pageIndex === 0 || isLoading}
                                        onClick={() =>
                                            setPageIndex((prev) =>
                                                Math.max(0, prev - 1)
                                            )
                                        }
                                        size="sm"
                                        variant="outline"
                                    >
                                        <RiArrowLeftSLine className="mr-1 size-4" />
                                        Prev
                                    </Button>
                                    <Button
                                        disabled={
                                            pageIndex >=
                                                table.getPageCount() - 1 ||
                                            isLoading
                                        }
                                        onClick={() =>
                                            setPageIndex((prev) =>
                                                Math.min(
                                                    table.getPageCount() - 1,
                                                    prev + 1
                                                )
                                            )
                                        }
                                        size="sm"
                                        variant="outline"
                                    >
                                        Next
                                        <RiArrowRightSLine className="ml-1 size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {!isLoading && tableData.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-white/60">No journals found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
