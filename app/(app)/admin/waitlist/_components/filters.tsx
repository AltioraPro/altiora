import type { FilterFn } from "@tanstack/react-table";
import type { WaitlistStatus } from "@/server/routers/auth/validators";

export type Item = {
    id: string;
    email: string;
    status: WaitlistStatus;
    createdAt: Date;
    addedBy: string | null;
    isRegistered: boolean;
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
        role: string | null;
        emailVerified: boolean;
    } | null;
    addedByUser: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    } | null;
};

// Custom filter function for multi-column searching
export const multiColumnFilterFn: FilterFn<Item> = (
    row,
    _columnId,
    filterValue
) => {
    const searchableRowContent = `${row.original.email}`.toLowerCase();
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
        | "rejected";
    return filterValue.includes(status);
};

