import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { WaitlistStatus } from "@/server/routers/auth/validators";
import RowActions from "./actions";
import { type Item, roleFilterFn, statusFilterFn } from "./filters";

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
        header: "Status",
        accessorKey: "accessStatus",
        cell: ({ row }) => {
            const accessStatus = row.getValue("accessStatus") as {
                status: WaitlistStatus;
            } | null;
            const status = accessStatus?.status ?? null;
            if (!status) {
                return (
                    <Badge
                        className="flex w-fit items-center gap-2 capitalize"
                        variant="outline"
                    >
                        <span className="size-2 rounded-full bg-muted-foreground/60 text-primary-foreground" />
                        N/A
                    </Badge>
                );
            }
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
        cell: ({ row }) => <RowActions row={row} />,
        size: 60,
        enableHiding: false,
    },
];
