import { createSearchParamsCache, parseAsStringEnum } from "nuqs/server";

export const settingsSearchParams = {
    page: parseAsStringEnum([
        "security",
        "account-billing",
        "contact",
        "privacy",
        "integrations",
    ]),
};

export const searchParamsCache = createSearchParamsCache(settingsSearchParams);
