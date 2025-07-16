import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { syncUserSchema } from "./validators";
import { getCurrentUser } from "./queries";
import { syncUser } from "./mutations";

export const authRouter = createTRPCRouter({
  // Queries
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    return await getCurrentUser({ db, session });
  }),

  // Mutations
  syncUser: publicProcedure
    .input(syncUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      return await syncUser({ input, db, session });
    }),
}); 