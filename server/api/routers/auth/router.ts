import { eq } from "drizzle-orm";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import { discordProfile } from "@/server/db/schema";
import {
    sendVerificationEmail,
    syncUser,
    updateLeaderboardVisibility,
    updateProfile,
    updateRank,
    verifyEmail,
} from "./mutations";
import { getCurrentUser, getUserEmailStatus } from "./queries";
import {
    getUserEmailStatusSchema,
    sendVerificationEmailSchema,
    syncUserSchema,
    updateLeaderboardVisibilitySchema,
    updateProfileSchema,
    updateRankSchema,
    verifyEmailSchema,
} from "./validators";

export const authRouter = createTRPCRouter({
    getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
        const { db, session } = ctx;
        const userData = await getCurrentUser({ db, session });
        const discordProfileData = await db.query.discordProfile.findFirst({
            where: eq(discordProfile.id, session.user.id),
        });
        return { ...userData, discordProfile: discordProfileData };
    }),

    getUserEmailStatus: publicProcedure
        .input(getUserEmailStatusSchema)
        .query(
            async ({ input }) =>
                await getUserEmailStatus({ email: input.email })
        ),

    syncUser: publicProcedure
        .input(syncUserSchema)
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            return await syncUser({ input, db, session });
        }),

    sendVerificationEmail: publicProcedure
        .input(sendVerificationEmailSchema)
        .mutation(
            async ({ input }) =>
                await sendVerificationEmail({ email: input.email })
        ),

    verifyEmail: publicProcedure
        .input(verifyEmailSchema)
        .mutation(
            async ({ input }) => await verifyEmail({ token: input.token })
        ),

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
            return await updateLeaderboardVisibility(
                { db, session, input },
                input
            );
        }),
});
