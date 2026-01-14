import { call } from "@orpc/server";
import { base } from "@/server/context";
import {
    connectCTraderAccountBase,
    connectCTraderAccountHandler,
    disconnectAllCTraderBase,
    disconnectAllCTraderHandler,
    disconnectCTraderAccountBase,
    disconnectCTraderAccountHandler,
    syncCTraderPositionsBase,
    syncCTraderPositionsHandler,
} from "./mutations";
import {
    getCTraderAccountsBase,
    getCTraderAccountsHandler,
    getCTraderConnectionsBase,
    getCTraderConnectionsHandler,
} from "./queries";

/**
 * cTrader Integration Router
 * Handles OAuth-based cTrader account connections and position syncing
 */
export const ctraderRouter = base.router({
    // Queries
    getAccounts: getCTraderAccountsBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getCTraderAccountsHandler, {}, { context })
        ),

    getConnections: getCTraderConnectionsBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getCTraderConnectionsHandler, {}, { context })
        ),

    // Mutations
    connectAccount: connectCTraderAccountBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(connectCTraderAccountHandler, input, { context })
        ),

    syncPositions: syncCTraderPositionsBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(syncCTraderPositionsHandler, input, { context })
        ),

    disconnectAccount: disconnectCTraderAccountBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(disconnectCTraderAccountHandler, input, { context })
        ),

    disconnectAll: disconnectAllCTraderBase
        .route({ method: "POST" })
        .handler(
            async ({ context }) =>
                await call(disconnectAllCTraderHandler, {}, { context })
        ),
});
