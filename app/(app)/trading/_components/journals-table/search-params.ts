import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsStringEnum,
} from "nuqs/server";

export const sortableColumns = ["name", "totalPnL", "winRate", "totalTrades"];

export type SortableColumn = "name" | "totalPnL" | "winRate" | "totalTrades";

export const journalsTableParsers = {
    // Pagination
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(8),

    // Sorting
    sortBy: parseAsStringEnum(sortableColumns).withDefault("totalPnL"),
    sortOrder: parseAsStringEnum(["asc", "desc"]).withDefault("desc"),
};

export const journalsTableParsersCache =
    createSearchParamsCache(journalsTableParsers);
