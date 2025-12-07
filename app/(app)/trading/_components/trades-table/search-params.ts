import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsStringEnum,
} from "nuqs/server";

export const sortableColumns = [
    "tradeDate",
    "assetId",
    "sessionId",
    "profitLossPercentage",
];

export type SortableColumn =
    | "tradeDate"
    | "assetId"
    | "sessionId"
    | "profitLossPercentage";

export const tradesTableParsers = {
    // Pagination
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),

    // Sorting
    sortBy: parseAsStringEnum(sortableColumns).withDefault("tradeDate"),
    sortOrder: parseAsStringEnum(["asc", "desc"]).withDefault("desc"),
};

export const tradesTableParsersCache =
    createSearchParamsCache(tradesTableParsers);
