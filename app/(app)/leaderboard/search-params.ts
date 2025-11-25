import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsStringEnum,
} from "nuqs/server";

export const leaderboardSearchParams = {
    period: parseAsStringEnum(["all", "week", "month", "year"]).withDefault(
        "all"
    ),
    page: parseAsInteger.withDefault(1),
};

export const searchParamsCache = createSearchParamsCache(
    leaderboardSearchParams
);
