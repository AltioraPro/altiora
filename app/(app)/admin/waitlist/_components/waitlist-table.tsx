"use client";

import { RiCheckboxCircleFill, RiCheckboxCircleLine } from "@remixicon/react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
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
import { adminWaitlistParsers } from "../search-params";
import { columns } from "./columns";
import type { Item } from "./filters";
import { Filters } from "./filters/index";
import TablePagination from "./pagination";

type SortableColumn =
    | "email"
    | "waitlistStatus"
    | "registrationStatus"
    | "createdAt";

export default function WaitlistTable() {
    const [
        { search, sortBy, sortOrder, page, limit, waitlistStatus },
        setQueryStates,
    ] = useQueryStates(adminWaitlistParsers);

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

    const { data: waitlist } = useQuery(
        orpc.auth.listWaitlist.queryOptions({
            input: {
                page,
                limit,
                sortBy: sortBy as SortableColumn,
                sortOrder,
                search,
                waitlistStatus,
            },
            placeholderData: keepPreviousData,
        })
    );

    const data = useMemo(
        () =>
            (waitlist?.waitlist ?? []).map((item) => ({
                ...item,
                status: item.status as Item["status"],
                addedByUser: item.addedByUser
                    ? {
                          id: item.addedByUser.id,
                          name: item.addedByUser.name ?? "",
                          email: item.addedByUser.email ?? "",
                          image: item.addedByUser.image,
                      }
                    : null,
            })) as Item[],
        [waitlist]
    );

    const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation(
        orpc.auth.updateMultipleUsersStatus.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.auth.listWaitlist.queryKey({
                        input: {
                            page,
                            limit,
                            sortBy: sortBy as SortableColumn,
                            sortOrder,
                            search,
                            waitlistStatus,
                        },
                    }),
                ],
            },
        })
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

    const handleApprove = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const emails = selectedRows.map((row) => row.original.email);
        updateStatus({ emails, status: "approved" });
    };

    const handleReject = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const emails = selectedRows.map((row) => row.original.email);
        updateStatus({ emails, status: "rejected" });
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Filters />
                <div className="flex items-center gap-3">
                    {/* Approve/Reject button group */}
                    {table.getSelectedRowModel().rows.length > 0 && (
                        <ButtonGroup className="ml-auto">
                            <ButtonGroupText>
                                <Label>
                                    {table.getSelectedRowModel().rows.length}{" "}
                                    selected
                                </Label>
                            </ButtonGroupText>
                            <Button
                                disabled={isUpdatingStatus}
                                onClick={handleApprove}
                                variant="outline"
                            >
                                <RiCheckboxCircleFill
                                    aria-hidden="true"
                                    className="-ms-1 opacity-60"
                                    size={16}
                                />
                                Approve
                            </Button>
                            <Button
                                disabled={isUpdatingStatus}
                                onClick={handleReject}
                                variant="outline"
                            >
                                <RiCheckboxCircleLine
                                    aria-hidden="true"
                                    className="-ms-1 opacity-60"
                                    size={16}
                                />
                                Reject
                            </Button>
                        </ButtonGroup>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-md border bg-background">
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

            {waitlist?.pagination && (
                <TablePagination
                    limit={limit}
                    onLimitChange={setLimit}
                    onPageChange={setPage}
                    page={page}
                    pagination={waitlist?.pagination}
                />
            )}
        </div>
    );
}
