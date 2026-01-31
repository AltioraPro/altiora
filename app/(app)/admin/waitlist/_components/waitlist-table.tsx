"use client";

import { RiDeleteBinLine } from "@remixicon/react";
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { useMemo } from "react";
import TablePagination from "@/app/(app)/admin/_components/pagination";
import { Button } from "@/components/ui/button";
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
import { adminWaitlistParsers, type SortableColumn } from "../search-params";
import { columns, type WaitlistItem } from "./columns";
import { Filters } from "./filters";

export default function WaitlistTable() {
    const queryClient = useQueryClient();
    const [{ search, sortBy, sortOrder, page, limit }, setQueryStates] =
        useQueryStates(adminWaitlistParsers);

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

    const { data: waitlistData } = useQuery(
        orpc.waitlist.list.queryOptions({
            input: {
                page,
                limit,
                sortBy: sortBy as SortableColumn,
                sortOrder,
                search,
            },
            placeholderData: keepPreviousData,
        })
    );

    const deleteMutation = useMutation(
        orpc.waitlist.delete.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ["waitlist", "list"],
                });
                table.resetRowSelection();
            },
        })
    );

    const data = useMemo(
        () =>
            (waitlistData?.entries ?? []).map((entry) => ({
                id: entry.id,
                email: entry.email,
                firstName: entry.firstName,
                createdAt: entry.createdAt,
            })) as WaitlistItem[],
        [waitlistData]
    );

    const table = useReactTable<WaitlistItem>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
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
        enableRowSelection: true,
    });

    const selectedIds = table
        .getSelectedRowModel()
        .rows.map((row) => row.original.id);

    const handleDelete = () => {
        if (selectedIds.length > 0) {
            deleteMutation.mutate({ ids: selectedIds });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-2xl">Waitlist</h1>
                <span className="text-muted-foreground">
                    {waitlistData?.pagination.total ?? 0} inscrits
                </span>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Filters />
                {selectedIds.length > 0 && (
                    <Button
                        disabled={deleteMutation.isPending}
                        onClick={handleDelete}
                        size="sm"
                        variant="destructive"
                    >
                        <RiDeleteBinLine className="size-4" />
                        Supprimer ({selectedIds.length})
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden border bg-background">
                <Table className="table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                className="hover:bg-transparent"
                                key={headerGroup.id}
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        className="h-11"
                                        key={header.id}
                                        style={{
                                            width: `${header.getSize()}px`,
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
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
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                    key={row.id}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            className="last:py-0"
                                            key={cell.id}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    className="h-24 text-center"
                                    colSpan={columns.length}
                                >
                                    Aucun résultat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {waitlistData?.pagination && (
                <TablePagination
                    itemName="inscrits"
                    limit={limit}
                    onLimitChange={setLimit}
                    onPageChange={setPage}
                    page={page}
                    pagination={waitlistData.pagination}
                />
            )}
        </div>
    );
}
