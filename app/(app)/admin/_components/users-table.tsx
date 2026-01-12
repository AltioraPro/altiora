"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { useMemo } from "react";
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
import { adminUsersParsers } from "../search-params";
import { columns } from "./columns";
import type { Item } from "./filters";
import { Filters } from "./filters/index";
import TablePagination from "./pagination";

type SortableColumn = "user" | "role" | "createdAt";

export default function UsersTable() {
    const [{ search, sortBy, sortOrder, page, limit, role }, setQueryStates] =
        useQueryStates(adminUsersParsers);

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

    const { data: usersData } = useQuery(
        orpc.auth.listUsers.queryOptions({
            input: {
                page,
                limit,
                sortBy: sortBy as SortableColumn,
                sortOrder,
                search,
                role: role === "all" ? undefined : role,
            },
            placeholderData: keepPreviousData,
        })
    );

    const data = useMemo(
        () =>
            (usersData?.users ?? []).map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                banned: user.banned ?? false,
                createdAt: user.createdAt,
                subscriptionId: user.subscriptionId,
                subscriptionStatus: user.subscriptionStatus,
                subscriptionPlan: user.subscriptionPlan,
            })) as Item[],
        [usersData]
    );

    const table = useReactTable<Item>({
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
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Filters />
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
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {usersData?.pagination && (
                <TablePagination
                    limit={limit}
                    onLimitChange={setLimit}
                    onPageChange={setPage}
                    page={page}
                    pagination={usersData?.pagination}
                />
            )}
        </div>
    );
}
