import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import RowActions from "./actions";
import { type Item, roleFilterFn } from "./filters";

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
        header: "User",
        accessorKey: "name",
        cell: ({ row }) => {
            const name = row.original.name;
            const email = row.original.email;
            return (
                <div className="flex flex-col">
                    {name && <span className="font-medium">{name}</span>}
                    <span className="text-muted-foreground text-sm">
                        {email}
                    </span>
                </div>
            );
        },
        size: 220,
    },
    {
        header: "Role",
        accessorKey: "role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string | null;
            return (
                <Badge
                    className={cn("flex w-fit items-center gap-2 capitalize")}
                    variant="outline"
                >
                    {role ?? "user"}
                </Badge>
            );
        },
        size: 100,
        filterFn: roleFilterFn,
    },
    {
        header: "Ban status",
        accessorKey: "banned",
        cell: ({ row }) => {
            const banned = row.getValue("banned") as boolean | null;
            return (
                <Badge
                    className={cn("flex w-fit items-center gap-2 capitalize")}
                    variant={banned ? "destructive" : "outline"}
                >
                    {banned ? "Banned" : "Active"}
                </Badge>
            );
        },
        size: 100,
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
        cell: ({ row }) => <RowActions row={row} />,
        size: 60,
        enableHiding: false,
    },
];
