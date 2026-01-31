import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";

export const sortableColumns = ["email", "firstName", "createdAt"];

export type SortableColumn = "email" | "firstName" | "createdAt";

export const adminWaitlistParsers = {
    // Filters
    search: parseAsString,

    // Pagination
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),

    // Sorting
    sortBy: parseAsStringEnum(sortableColumns).withDefault("createdAt"),
    sortOrder: parseAsStringEnum(["asc", "desc"]).withDefault("desc"),
};

export const adminWaitlistParsersCache =
    createSearchParamsCache(adminWaitlistParsers);
