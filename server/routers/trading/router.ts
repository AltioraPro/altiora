import { call } from "@orpc/server";
import { base } from "@/server/context";
import {
    createAdvancedTradeBase,
    createAdvancedTradeHandler,
    createConfirmationBase,
    createConfirmationHandler,
    createTradingAssetBase,
    createTradingAssetHandler,
    createTradingJournalBase,
    createTradingJournalHandler,
    createTradingSessionBase,
    createTradingSessionHandler,
    deleteAdvancedTradeBase,
    deleteAdvancedTradeHandler,
    deleteConfirmationBase,
    deleteConfirmationHandler,
    deleteMultipleTradesBase,
    deleteMultipleTradesHandler,
    deleteTradingAssetBase,
    deleteTradingAssetHandler,
    deleteTradingJournalBase,
    deleteTradingJournalHandler,
    deleteTradingSessionBase,
    deleteTradingSessionHandler,
    reorderJournalsBase,
    reorderJournalsHandler,
    updateAdvancedTradeBase,
    updateAdvancedTradeHandler,
    updateConfirmationBase,
    updateConfirmationHandler,
    updateTradingAssetBase,
    updateTradingAssetHandler,
    updateTradingJournalBase,
    updateTradingJournalHandler,
    updateTradingSessionBase,
    updateTradingSessionHandler,
} from "./mutations";
import {
    getAdvancedTradeByIdBase,
    getAdvancedTradeByIdHandler,
} from "./queries/get-advanced-trade-by-id";
import {
    getAdvancedTradesBase,
    getAdvancedTradesHandler,
} from "./queries/get-advanced-trades";
import {
    getCurrentCapitalBase,
    getCurrentCapitalHandler,
} from "./queries/get-current-capital";
import {
    getJournalOverviewBase,
    getJournalOverviewHandler,
} from "./queries/get-journal-overview";
import {
    getJournalsTableDataBase,
    getJournalsTableDataHandler,
} from "./queries/get-journals-table-data";
import {
    getSnapshotDataBase,
    getSnapshotDataHandler,
} from "./queries/get-snapshot-data";
import {
    getTradingAssetByIdBase,
    getTradingAssetByIdHandler,
} from "./queries/get-trading-asset-by-id";
import {
    getTradingAssetsBase,
    getTradingAssetsHandler,
} from "./queries/get-trading-assets";
import {
    getConfirmationByIdBase,
    getConfirmationByIdHandler,
} from "./queries/get-trading-confirmation-by-id";
import {
    getTradingConfirmationsBase,
    getTradingConfirmationsHandler,
} from "./queries/get-trading-confirmations";
import {
    getTradingJournalByIdBase,
    getTradingJournalByIdHandler,
} from "./queries/get-trading-journal-by-id";
import {
    getTradingJournalsBase,
    getTradingJournalsHandler,
} from "./queries/get-trading-journals";
import {
    getTradingJournalsFilterBase,
    getTradingJournalsFilterHandler,
} from "./queries/get-trading-journals-filter";
import {
    getTradingSessionByIdBase,
    getTradingSessionByIdHandler,
} from "./queries/get-trading-session-by-id";
import {
    getTradingSessionsBase,
    getTradingSessionsHandler,
} from "./queries/get-trading-sessions";
import {
    getTradingStatsBase,
    getTradingStatsHandler,
} from "./queries/get-trading-stats";

export const tradingRouter = base.router({
    // Journal Mutations
    createJournal: createTradingJournalBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(createTradingJournalHandler, input, { context })
        ),

    updateJournal: updateTradingJournalBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateTradingJournalHandler, input, { context })
        ),

    deleteJournal: deleteTradingJournalBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(deleteTradingJournalHandler, input, { context })
        ),

    reorderJournals: reorderJournalsBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(reorderJournalsHandler, input, { context })
        ),

    // Asset Mutations
    createAsset: createTradingAssetBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(createTradingAssetHandler, input, { context })
        ),

    updateAsset: updateTradingAssetBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateTradingAssetHandler, input, { context })
        ),

    deleteAsset: deleteTradingAssetBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(deleteTradingAssetHandler, input, { context })
        ),

    // Session Mutations
    createSession: createTradingSessionBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(createTradingSessionHandler, input, { context })
        ),

    updateSession: updateTradingSessionBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateTradingSessionHandler, input, { context })
        ),

    deleteSession: deleteTradingSessionBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(deleteTradingSessionHandler, input, { context })
        ),

    // Confirmation Mutations
    createConfirmation: createConfirmationBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(createConfirmationHandler, input, { context })
        ),

    updateConfirmation: updateConfirmationBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateConfirmationHandler, input, { context })
        ),

    deleteConfirmation: deleteConfirmationBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(deleteConfirmationHandler, input, { context })
        ),

    // Trade Mutations
    createTrade: createAdvancedTradeBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(createAdvancedTradeHandler, input, { context })
        ),

    updateTrade: updateAdvancedTradeBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateAdvancedTradeHandler, input, { context })
        ),

    deleteTrade: deleteAdvancedTradeBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(deleteAdvancedTradeHandler, input, { context })
        ),

    deleteMultipleTrades: deleteMultipleTradesBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(deleteMultipleTradesHandler, input, { context })
        ),

    // Journal Queries
    getJournals: getTradingJournalsBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getTradingJournalsHandler, undefined, { context })
        ),

    getJournalsFilter: getTradingJournalsFilterBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getTradingJournalsFilterHandler, undefined, {
                    context,
                })
        ),

    getJournalById: getTradingJournalByIdBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getTradingJournalByIdHandler, input, { context })
        ),

    // Asset Queries
    getAssets: getTradingAssetsBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getTradingAssetsHandler, input, { context })
        ),

    getAssetById: getTradingAssetByIdBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getTradingAssetByIdHandler, input, { context })
        ),

    // Session Queries
    getSessions: getTradingSessionsBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getTradingSessionsHandler, input, { context })
        ),

    getSessionById: getTradingSessionByIdBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getTradingSessionByIdHandler, input, { context })
        ),

    // Confirmation Queries
    getConfirmations: getTradingConfirmationsBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getTradingConfirmationsHandler, input, { context })
        ),

    getConfirmationById: getConfirmationByIdBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getConfirmationByIdHandler, input, { context })
        ),

    // Trade Queries
    getTrades: getAdvancedTradesBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getAdvancedTradesHandler, input, { context })
        ),

    getTradeById: getAdvancedTradeByIdBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getAdvancedTradeByIdHandler, input, { context })
        ),

    getStats: getTradingStatsBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getTradingStatsHandler, input, { context })
        ),

    getCurrentCapital: getCurrentCapitalBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getCurrentCapitalHandler, input, { context })
        ),

    getJournalOverview: getJournalOverviewBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getJournalOverviewHandler, input, { context })
        ),

    getJournalsTableData: getJournalsTableDataBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getJournalsTableDataHandler, input ?? {}, {
                    context,
                })
        ),

    getSnapshotData: getSnapshotDataBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getSnapshotDataHandler, input, { context })
        ),
});
