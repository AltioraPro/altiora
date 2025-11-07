import { call } from "@orpc/server";
import { base } from "@/server/context";
import {
    autoSyncRankBase,
    autoSyncRankHandler,
    disconnectBase,
    disconnectHandler,
    getAuthUrlBase,
    getAuthUrlHandler,
    syncAllUsersBase,
    syncAllUsersHandler,
    syncRankBase,
    syncRankHandler,
} from "./mutations";
import {
    checkBotStatusBase,
    checkBotStatusHandler,
} from "./queries/check-bot-status";
import {
    getConnectionStatusBase,
    getConnectionStatusHandler,
} from "./queries/get-connection-status";

export const discordRouter = base.router({
    // Queries
    getConnectionStatus: getConnectionStatusBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getConnectionStatusHandler, undefined, { context })
        ),

    checkBotStatus: checkBotStatusBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(checkBotStatusHandler, undefined, { context })
        ),

    // Mutations
    disconnect: disconnectBase
        .route({ method: "POST" })
        .handler(
            async ({ context }) =>
                await call(disconnectHandler, undefined, { context })
        ),

    syncRank: syncRankBase
        .route({ method: "POST" })
        .handler(
            async ({ context }) =>
                await call(syncRankHandler, undefined, { context })
        ),

    autoSyncRank: autoSyncRankBase
        .route({ method: "POST" })
        .handler(
            async ({ context }) =>
                await call(autoSyncRankHandler, undefined, { context })
        ),

    syncAllUsers: syncAllUsersBase
        .route({ method: "POST" })
        .handler(
            async ({ context }) =>
                await call(syncAllUsersHandler, undefined, { context })
        ),

    getAuthUrl: getAuthUrlBase
        .route({ method: "POST" })
        .handler(
            async ({ context }) =>
                await call(getAuthUrlHandler, undefined, { context })
        ),
});
