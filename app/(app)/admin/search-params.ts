import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";

export const sortableColumns = ["user", "role", "createdAt"];

export type SortableColumn = "user" | "role" | "createdAt";

export const adminUsersParsers = {
    // Filters
    search: parseAsString,
    role: parseAsStringEnum(["admin", "user", "all"]).withDefault("all"),

    // Pagination
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),

    // Sorting
    sortBy: parseAsStringEnum(sortableColumns).withDefault("createdAt"),
    sortOrder: parseAsStringEnum(["asc", "desc"]).withDefault("desc"),
};

export const adminUsersParsersCache =
    createSearchParamsCache(adminUsersParsers);
