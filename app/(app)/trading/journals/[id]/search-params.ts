import {
    createSearchParamsCache,
    parseAsJson,
    parseAsStringEnum,
} from "nuqs/server";
import { z } from "zod";

const dateFilterSchema = z.object({
    view: z.enum(["monthly", "yearly", "all"]),
    month: z.string().optional(),
    year: z.string().optional(),
});

export const tradingJournalSearchParams = {
    tab: parseAsStringEnum([
        "trades",
        "assets",
        "sessions",
        "setups",
    ]).withDefault("trades"),
    dateFilter: parseAsJson(dateFilterSchema).withDefault({ view: "all" }),
};

export const searchParamsCache = createSearchParamsCache(
    tradingJournalSearchParams
);
