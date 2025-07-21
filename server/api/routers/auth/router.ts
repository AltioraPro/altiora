import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { syncUserSchema, sendVerificationEmailSchema, getUserEmailStatusSchema, verifyEmailSchema } from "./validators";
import { getCurrentUser, getUserEmailStatus } from "./queries";
import { syncUser, sendVerificationEmail, verifyEmail } from "./mutations";

export const authRouter = createTRPCRouter({
  // Queries
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    return await getCurrentUser({ db, session });
  }),

  getUserEmailStatus: publicProcedure
    .input(getUserEmailStatusSchema)
    .query(async ({ input }) => {
      return await getUserEmailStatus({ email: input.email });
    }),

  // Mutations
  syncUser: publicProcedure
    .input(syncUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      return await syncUser({ input, db, session });
    }),

  sendVerificationEmail: publicProcedure
    .input(sendVerificationEmailSchema)
    .mutation(async ({ input }) => {
      return await sendVerificationEmail({ email: input.email });
    }),

  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input }) => {
      return await verifyEmail({ token: input.token });
    }),
}); 