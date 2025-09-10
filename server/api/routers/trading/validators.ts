import { z } from "zod";

// Validateur pour créer un journal de trading
export const createTradingJournalSchema = z.object({
  name: z.string().min(1, "Journal name is required").max(255),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  startingCapital: z.string().optional(),
  usePercentageCalculation: z.boolean().default(false),
});

// Validateur pour mettre à jour un journal de trading
export const updateTradingJournalSchema = z.object({
  id: z.string().min(1, "Journal ID is required"),
  name: z.string().min(1, "Journal name is required").max(255).optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  startingCapital: z.string().optional(),
  usePercentageCalculation: z.boolean().optional(),
});

// Validateur pour créer un asset
export const createTradingAssetSchema = z.object({
  journalId: z.string().min(1, "Journal ID is required"),
  name: z.string().min(1, "Asset name is required").max(50),
  symbol: z.string().max(20).optional(),
  type: z.enum(["forex", "crypto", "stocks", "commodities"]).default("forex"),
});

// Validateur pour mettre à jour un asset
export const updateTradingAssetSchema = z.object({
  id: z.string().min(1, "Asset ID is required"),
  name: z.string().min(1, "Asset name is required").max(50).optional(),
  symbol: z.string().max(20).optional(),
  type: z.enum(["forex", "crypto", "stocks", "commodities"]).optional(),
  isActive: z.boolean().optional(),
});

// Validateur pour créer une session de trading
export const createTradingSessionSchema = z.object({
  journalId: z.string().min(1, "Journal ID is required"),
  name: z.string().min(1, "Session name is required").max(100),
  description: z.string().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
  timezone: z.string().default("UTC"),
});

// Validateur pour mettre à jour une session de trading
export const updateTradingSessionSchema = z.object({
  id: z.string().min(1, "Session ID is required"),
  name: z.string().min(1, "Session name is required").max(100).optional(),
  description: z.string().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Validateur pour créer un setup de trading
export const createTradingSetupSchema = z.object({
  journalId: z.string().min(1, "Journal ID is required"),
  name: z.string().min(1, "Setup name is required").max(100),
  description: z.string().optional(),
  strategy: z.string().optional(),
  successRate: z.number().min(0).max(100).optional(),
});

// Validateur pour mettre à jour un setup de trading
export const updateTradingSetupSchema = z.object({
  id: z.string().min(1, "Setup ID is required"),
  name: z.string().min(1, "Setup name is required").max(100).optional(),
  description: z.string().optional(),
  strategy: z.string().optional(),
  successRate: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

// Validateur pour créer un trade avancé
export const createAdvancedTradeSchema = z.object({
  journalId: z.string().min(1, "Journal ID is required"),
  assetId: z.string().optional(),
  sessionId: z.string().optional(),
  setupId: z.string().optional(),
  
  tradeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  symbol: z.string().max(50).optional(),
  
  // Gestion du risque
  riskInput: z.string().max(50).optional(),
  
  // Résultats
  profitLossAmount: z.string().max(50).optional(),
  profitLossPercentage: z.string().max(50).optional(),
  exitReason: z.enum(["TP", "BE", "SL", "Manual"]).optional(),
  
  // Liens et notes
  tradingviewLink: z.string().optional(),
  notes: z.string().optional(),
  
  // Métadonnées
  isClosed: z.boolean().default(false),
}).refine((data) => {
  // Au moins un des deux champs de résultat doit être rempli
  // Accepter explicitement "0" comme valeur valide
  return (data.profitLossAmount && data.profitLossAmount !== '') || 
         (data.profitLossPercentage && data.profitLossPercentage !== '');
}, {
  message: "Either profit/loss amount or percentage is required",
  path: ["profitLossAmount"]
});

// Validateur pour mettre à jour un trade avancé
export const updateAdvancedTradeSchema = z.object({
  id: z.string().min(1, "Trade ID is required"),
  assetId: z.string().optional(),
  sessionId: z.string().optional(),
  setupId: z.string().optional(),
  
  tradeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  symbol: z.string().max(50).optional(),
  
  // Gestion du risque
  riskInput: z.string().max(50).optional(),
  
  // Résultats
  profitLossAmount: z.string().max(50).optional(),
  profitLossPercentage: z.string().max(50).optional(),
  exitReason: z.enum(["TP", "BE", "SL", "Manual"]).optional(),
  
  // Liens et notes
  tradingviewLink: z.string().optional(),
  notes: z.string().optional(),
  
  // Métadonnées
  isClosed: z.boolean().optional(),
});

// Validateur pour filtrer les trades
export const filterTradesSchema = z.object({
  journalId: z.string().optional(),
  assetId: z.string().optional(),
  sessionId: z.string().optional(),
  setupId: z.string().optional(),
  symbol: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  isClosed: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Validateur pour les statistiques de trading
export const tradingStatsSchema = z.object({
  journalId: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
});

// Validateur pour réorganiser les journaux
export const reorderJournalsSchema = z.object({
  journalIds: z.array(z.string()).min(1, "At least one journal required"),
}); 