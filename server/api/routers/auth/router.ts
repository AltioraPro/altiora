import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  syncUserSchema,
  sendVerificationEmailSchema,
  getUserEmailStatusSchema,
  verifyEmailSchema,
  updateProfileSchema,
  updateRankSchema,
  updateLeaderboardVisibilitySchema,
} from "./validators";
import { getCurrentUser, getUserEmailStatus } from "./queries";
import {
  syncUser,
  sendVerificationEmail,
  verifyEmail,
  updateProfile,
  updateRank,
  updateLeaderboardVisibility,
} from "./mutations";

export const authRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    return await getCurrentUser({ db, session });
  }),

  getUserEmailStatus: publicProcedure
    .input(getUserEmailStatusSchema)
    .query(async ({ input }) => {
      return await getUserEmailStatus({ email: input.email });
    }),

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

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      return await updateProfile({ db, session, input }, input);
    }),

  updateRank: protectedProcedure
    .input(updateRankSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      return await updateRank({ db, session, input }, input);
    }),

  updateLeaderboardVisibility: protectedProcedure
    .input(updateLeaderboardVisibilitySchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      return await updateLeaderboardVisibility({ db, session, input }, input);
    }),
});
