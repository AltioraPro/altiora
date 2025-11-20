import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";

export const sortableColumns = [
    "email",
    "waitlistStatus",
    "registrationStatus",
    "createdAt",
];

export type SortableColumn =
    | "email"
    | "waitlistStatus"
    | "registrationStatus"
    | "createdAt";

export const adminWaitlistParsers = {
    // Filters
    search: parseAsString,
    waitlistStatus: parseAsStringEnum([
        "approved",
        "pending",
        "rejected",
        "all",
    ]).withDefault("all"),

    // Pagination
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),

    // Sorting
    sortBy: parseAsStringEnum(sortableColumns).withDefault("createdAt"),
    sortOrder: parseAsStringEnum(["asc", "desc"]).withDefault("desc"),
};

export const adminWaitlistParsersCache =
    createSearchParamsCache(adminWaitlistParsers);

