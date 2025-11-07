import { call } from "@orpc/server";
import { base } from "@/server/context";
import {
    sendVerificationEmailBase,
    sendVerificationEmailHandler,
    syncUserBase,
    syncUserHandler,
    updateLeaderboardVisibilityBase,
    updateLeaderboardVisibilityHandler,
    updateProfileBase,
    updateProfileHandler,
    updateRankBase,
    updateRankHandler,
    verifyEmailBase,
    verifyEmailHandler,
} from "./mutations";
import { getMeBase, getMeHandler } from "./queries/get-me";
import {
    getUserEmailStatusBase,
    getUserEmailStatusHandler,
} from "./queries/get-user-email-status";

export const authRouter = base.router({
    // Queries
    getCurrentUser: getMeBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getMeHandler, undefined, { context })
        ),

    getUserEmailStatus: getUserEmailStatusBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getUserEmailStatusHandler, input, { context })
        ),

    // Mutations
    syncUser: syncUserBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(syncUserHandler, input, { context })
        ),

    sendVerificationEmail: sendVerificationEmailBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(sendVerificationEmailHandler, input, { context })
        ),

    verifyEmail: verifyEmailBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(verifyEmailHandler, input, { context })
        ),

    updateProfile: updateProfileBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateProfileHandler, input, { context })
        ),

    updateRank: updateRankBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateRankHandler, input, { context })
        ),

    updateLeaderboardVisibility: updateLeaderboardVisibilityBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateLeaderboardVisibilityHandler, input, {
                    context,
                })
        ),
});
