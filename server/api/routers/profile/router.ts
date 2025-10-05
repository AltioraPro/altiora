import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getUserStats } from "./queries/getUserStats";
import { getHabitHeatmap } from "./queries/getHabitHeatmap";

export const profileRouter = createTRPCRouter({
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    return await getUserStats({ db, session });
  }),
  
  getHabitHeatmap: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    return await getHabitHeatmap({ db, session });
  }),
}); 