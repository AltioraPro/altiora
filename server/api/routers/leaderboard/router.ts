import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getLeaderboard } from "./queries/getLeaderboard";
import { z } from "zod";

const periodSchema = z.enum(["all", "week", "month", "year"]).default("all");

export const leaderboardRouter = createTRPCRouter({
  getLeaderboard: publicProcedure
    .input(z.object({ period: periodSchema }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      return await getLeaderboard(
        { db, session: session ? { userId: session.user.id } : null },
        input.period
      );
    }),
});
