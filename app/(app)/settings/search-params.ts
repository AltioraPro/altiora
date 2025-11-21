import { createSearchParamsCache, parseAsStringEnum } from "nuqs/server";

export const settingsSearchParams = {
    page: parseAsStringEnum([
        "security",
        "account-billing",
        "contact",
        "privacy",
        "integrations",
    ]).withDefault("account-billing"),
};

export const searchParamsCache = createSearchParamsCache(settingsSearchParams);
