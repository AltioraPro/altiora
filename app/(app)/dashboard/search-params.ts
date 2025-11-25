import {
    createSearchParamsCache,
    parseAsJson,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";
import { z } from "zod";

const journalIdsSchema = z.array(z.string()).optional();

export const dashboardSearchParams = {
    view: parseAsStringEnum(["monthly", "yearly", "all"]),
    month: parseAsString,
    year: parseAsString,
    journalIds: parseAsJson(journalIdsSchema),
};

export const searchParamsCache = createSearchParamsCache(dashboardSearchParams);
