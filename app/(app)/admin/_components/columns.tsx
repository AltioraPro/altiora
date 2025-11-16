import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { WaitlistStatus } from "@/server/routers/auth/validators";
import RowActions from "./actions";
import { type Item, statusFilterFn } from "./filters";

export const columns: ColumnDef<Item>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                aria-label="Select all"
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                aria-label="Select row"
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
        ),
        size: 28,
        enableSorting: false,
        enableHiding: false,
    },
    {
        header: "Email",
        accessorKey: "email",
        size: 220,
    },
    {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
            const status = row.getValue("status") as WaitlistStatus;
            return (
                <Badge
                    className={cn("flex w-fit items-center gap-2 capitalize")}
                    variant="outline"
                >
                    <span
                        className={cn(
                            "size-2 rounded-full bg-muted-foreground/60 text-primary-foreground",
                            status === "pending" && "bg-yellow-500",
                            status === "rejected" && "bg-red-500",
                            status === "approved" && "bg-green-500"
                        )}
                    />
                    {status}
                </Badge>
            );
        },
        size: 100,
        filterFn: statusFilterFn,
    },
    {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ row }) => (
            <span>{format(row.getValue("createdAt"), "d LLL yyyy")}</span>
        ),
        size: 100,
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row, table }) => <RowActions row={row} table={table} />,
        size: 60,
        enableHiding: false,
    },
];
