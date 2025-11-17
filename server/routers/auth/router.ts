import { call } from "@orpc/server";
import { USER_ROLES } from "@/constants/roles";
import { base } from "@/server/context";
import {
    banMultipleUsersBase,
    banMultipleUsersHandler,
    sendVerificationEmailBase,
    sendVerificationEmailHandler,
    syncUserBase,
    syncUserHandler,
    updateLeaderboardVisibilityBase,
    updateLeaderboardVisibilityHandler,
    updateMultipleUsersStatusBase,
    updateMultipleUsersStatusHandler,
    updateProfileBase,
    updateProfileHandler,
    updateRankBase,
    updateRankHandler,
    verifyEmailBase,
    verifyEmailHandler,
} from "./mutations";
import { getMeBase, getMeHandler } from "./queries";
import {
    getUserEmailStatusBase,
    getUserEmailStatusHandler,
    listUsersBase,
    listUsersHandler,
    listWaitlistBase,
    listWaitlistHandler,
} from "./queries/";

export const authRouter = base.router({
    // Queries

    listUsers: listUsersBase
        .route({ method: "GET" })
        .meta({ roles: [USER_ROLES.ADMIN] })
        .handler(
            async ({ input, context }) =>
                await call(listUsersHandler, input, {
                    context,
                })
        ),

    listWaitlist: listWaitlistBase
        .route({ method: "GET" })
        .meta({ roles: [USER_ROLES.ADMIN] })
        .handler(
            async ({ input, context }) =>
                await call(listWaitlistHandler, input, {
                    context,
                })
        ),

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

    banMultipleUsers: banMultipleUsersBase
        .route({ method: "PATCH" })
        .meta({ roles: [USER_ROLES.ADMIN] })
        .handler(
            async ({ input, context }) =>
                await call(banMultipleUsersHandler, input, {
                    context,
                })
        ),

    updateMultipleUsersStatus: updateMultipleUsersStatusBase
        .route({ method: "PATCH" })
        .meta({ roles: [USER_ROLES.ADMIN] })
        .handler(
            async ({ input, context }) =>
                await call(updateMultipleUsersStatusHandler, input, {
                    context,
                })
        ),
});
