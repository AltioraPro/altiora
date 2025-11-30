import {
    createSearchParamsCache,
    parseAsJson,
    parseAsStringEnum,
} from "nuqs/server";
import { z } from "zod";

const dateRangeSchema = z.object({
    from: z.string().nullable().optional(),
    to: z.string().nullable().optional(),
});

const stringArraySchema = z.array(z.string()).optional();

export const tradingJournalSearchParams = {
    tab: parseAsStringEnum([
        "trades",
        "assets",
        "sessions",
        "confirmations",
    ]).withDefault("trades"),
    dateRange: parseAsJson(dateRangeSchema).withDefault({
        from: null,
        to: null,
    }),
    sessions: parseAsJson(stringArraySchema),
    confirmations: parseAsJson(stringArraySchema),
    assets: parseAsJson(stringArraySchema),
};

export const searchParamsCache = createSearchParamsCache(
    tradingJournalSearchParams
);
