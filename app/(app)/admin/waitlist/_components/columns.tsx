import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

export interface WaitlistItem {
    id: string;
    email: string;
    firstName: string;
    createdAt: Date;
}

export const columns: ColumnDef<WaitlistItem>[] = [
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
        header: "Prénom",
        accessorKey: "firstName",
        size: 150,
    },
    {
        header: "Email",
        accessorKey: "email",
        size: 250,
    },
    {
        header: "Date d'inscription",
        accessorKey: "createdAt",
        cell: ({ row }) => (
            <span>{format(row.getValue("createdAt"), "d LLL yyyy HH:mm")}</span>
        ),
        size: 180,
    },
];
