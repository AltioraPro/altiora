import { createSearchParamsCache, parseAsStringEnum } from "nuqs/server";

export const viewModes = ["today", "week", "month"] as const;
export type ViewMode = (typeof viewModes)[number];

export const habitsSearchParams = {
  viewMode: parseAsStringEnum(["today", "week", "month"]).withDefault("month"),
};

export const habitsSearchParamsCache =
  createSearchParamsCache(habitsSearchParams);
