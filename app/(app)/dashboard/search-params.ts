import {
    createSearchParamsCache,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";

const searchParams = {
    view: parseAsStringEnum(["monthly", "yearly", "all"]),
    month: parseAsString,
    year: parseAsString,
};

export const searchParamsCache = createSearchParamsCache(searchParams);
