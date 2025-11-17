import { RiMoreLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import type { Row, Table } from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orpc } from "@/orpc/client";
import { adminWaitlistParsers, type SortableColumn } from "../search-params";
import type { Item } from "./filters";

export default function RowActions({
    table,
    row,
}: {
    table: Table<Item>;
    row: Row<Item>;
}) {
    const [{ page, limit, sortBy, sortOrder, search, waitlistStatus }] =
        useQueryStates(adminWaitlistParsers);

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
            onSuccess: () => {
                table.resetRowSelection();
            },
        })
    );

    const handleApprove = () => {
        updateStatus({ emails: [row.original.email], status: "approved" });
        table.resetRowSelection();
    };

    const handleReject = () => {
        updateStatus({ emails: [row.original.email], status: "rejected" });
        table.resetRowSelection();
    };

    const handleSetToPending = () => {
        updateStatus({ emails: [row.original.email], status: "pending" });
        table.resetRowSelection();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex justify-end">
                    <Button
                        aria-label="Edit item"
                        className="shadow-none"
                        size="icon"
                        variant="ghost"
                    >
                        <RiMoreLine aria-hidden="true" size={16} />
                    </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        disabled={isUpdatingStatus}
                        onClick={handleApprove}
                    >
                        <span>Approve access</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        disabled={isUpdatingStatus}
                        onClick={handleReject}
                    >
                        <span>Reject access</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        disabled={isUpdatingStatus}
                        onClick={handleSetToPending}
                    >
                        <span>Set to pending</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
