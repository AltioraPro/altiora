import { z } from "zod";

export const periodSchema = z.enum(["all", "week", "month", "year"]).default("all");

export const getLeaderboardSchema = z.object({
    period: periodSchema,
});

export type GetLeaderboardInput = z.infer<typeof getLeaderboardSchema>;
export type Period = z.infer<typeof periodSchema>;
