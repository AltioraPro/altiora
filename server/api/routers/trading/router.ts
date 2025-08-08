import { createTRPCRouter } from "@/server/api/trpc";
import { tradingMutationsRouter } from "./mutations";
import { tradingQueriesRouter } from "./queries";

export const tradingRouter = createTRPCRouter({
  // Mutations
  createJournal: tradingMutationsRouter.createTradingJournal,
  updateJournal: tradingMutationsRouter.updateTradingJournal,
  deleteJournal: tradingMutationsRouter.deleteTradingJournal,
  setDefaultJournal: tradingMutationsRouter.setDefaultTradingJournal,

  createAsset: tradingMutationsRouter.createTradingAsset,
  updateAsset: tradingMutationsRouter.updateTradingAsset,
  deleteAsset: tradingMutationsRouter.deleteTradingAsset,

  createSession: tradingMutationsRouter.createTradingSession,
  updateSession: tradingMutationsRouter.updateTradingSession,
  deleteSession: tradingMutationsRouter.deleteTradingSession,

  createSetup: tradingMutationsRouter.createTradingSetup,
  updateSetup: tradingMutationsRouter.updateTradingSetup,
  deleteSetup: tradingMutationsRouter.deleteTradingSetup,

  createTrade: tradingMutationsRouter.createAdvancedTrade,
  updateTrade: tradingMutationsRouter.updateAdvancedTrade,
  deleteTrade: tradingMutationsRouter.deleteAdvancedTrade,
  // closeTrade removed; no corresponding mutation

  // Queries
  getJournals: tradingQueriesRouter.getTradingJournals,
  getJournalById: tradingQueriesRouter.getTradingJournalById,
  getDefaultJournal: tradingQueriesRouter.getDefaultTradingJournal,

  getAssets: tradingQueriesRouter.getTradingAssets,
  getAssetById: tradingQueriesRouter.getTradingAssetById,

  getSessions: tradingQueriesRouter.getTradingSessions,
  getSessionById: tradingQueriesRouter.getTradingSessionById,

  getSetups: tradingQueriesRouter.getTradingSetups,
  getSetupById: tradingQueriesRouter.getTradingSetupById,

  getTrades: tradingQueriesRouter.getAdvancedTrades,
  getTradeById: tradingQueriesRouter.getAdvancedTradeById,
  getStats: tradingQueriesRouter.getTradingStats,
  getJournalOverview: tradingQueriesRouter.getJournalOverview,
}); 