import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getUserStats } from "./queries/getUserStats";

export const profileRouter = createTRPCRouter({
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    return await getUserStats({ db, session });
  }),
}); 