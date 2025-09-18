import { createTRPCRouter } from "@/server/api/trpc";
import { tradingMutationsRouter } from "./mutations";
import { tradingQueriesRouter } from "./queries";

export const tradingRouter = createTRPCRouter({
  // Mutations
  createJournal: tradingMutationsRouter.createTradingJournal,
  updateJournal: tradingMutationsRouter.updateTradingJournal,
  deleteJournal: tradingMutationsRouter.deleteTradingJournal,
  reorderJournals: tradingMutationsRouter.reorderJournals,

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
  deleteMultipleTrades: tradingMutationsRouter.deleteMultipleTrades,
  // closeTrade removed; no corresponding mutation

  // Queries
  getJournals: tradingQueriesRouter.getTradingJournals,
  getJournalById: tradingQueriesRouter.getTradingJournalById,

  getAssets: tradingQueriesRouter.getTradingAssets,
  getAssetById: tradingQueriesRouter.getTradingAssetById,

  getSessions: tradingQueriesRouter.getTradingSessions,
  getSessionById: tradingQueriesRouter.getTradingSessionById,

  getSetups: tradingQueriesRouter.getTradingSetups,
  getSetupById: tradingQueriesRouter.getTradingSetupById,

  getTrades: tradingQueriesRouter.getAdvancedTrades,
  getTradeById: tradingQueriesRouter.getAdvancedTradeById,
  getStats: tradingQueriesRouter.getTradingStats,
  getCurrentCapital: tradingQueriesRouter.getCurrentCapital,
  getJournalOverview: tradingQueriesRouter.getJournalOverview,
}); 