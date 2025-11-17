import { createSearchParamsCache, parseAsStringEnum } from "nuqs/server";

export const leaderboardSearchParams = {
    period: parseAsStringEnum(["all", "week", "month", "year"]).withDefault(
        "all"
    ),
};

export const searchParamsCache = createSearchParamsCache(
    leaderboardSearchParams
);
