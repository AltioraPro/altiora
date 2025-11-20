import type { FilterFn } from "@tanstack/react-table";
import type { WaitlistStatus } from "@/server/routers/auth/validators";

export type Item = {
    id: string;
    name: string | null;
    email: string;
    role: string | null;
    banned: boolean | null;
    createdAt: Date;
    accessStatus: {
        id: string;
        email: string;
        status: WaitlistStatus;
        createdAt: Date;
    } | null;
};

// Custom filter function for multi-column searching
export const multiColumnFilterFn: FilterFn<Item> = (
    row,
    _columnId,
    filterValue
) => {
    const searchableRowContent =
        `${row.original.name ?? ""} ${row.original.email}`.toLowerCase();
    const searchTerm = (filterValue ?? "").toLowerCase();
    return searchableRowContent.includes(searchTerm);
};

export const statusFilterFn: FilterFn<Item> = (
    row,
    columnId,
    filterValue: ("approved" | "pending" | "rejected")[]
) => {
    if (!filterValue?.length) {
        return true;
    }
    const status = row.getValue(columnId) as
        | "approved"
        | "pending"
        | "rejected"
        | null;
    if (!status) {
        return false;
    }
    return filterValue.includes(status);
};

export const roleFilterFn: FilterFn<Item> = (
    row,
    columnId,
    filterValue: ("admin" | "user")[]
) => {
    if (!filterValue?.length) {
        return true;
    }
    const role = row.getValue(columnId) as string | null;
    if (!role) {
        return false;
    }
    return filterValue.includes(role as "admin" | "user");
};
