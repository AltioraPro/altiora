import { z } from "zod";

// Validateur pour créer un journal de trading
export const createTradingJournalSchema = z.object({
  name: z.string().min(1, "Le nom du journal est requis").max(255),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// Validateur pour mettre à jour un journal de trading
export const updateTradingJournalSchema = z.object({
  id: z.string().min(1, "L'ID du journal est requis"),
  name: z.string().min(1, "Le nom du journal est requis").max(255).optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Validateur pour créer un asset
export const createTradingAssetSchema = z.object({
  journalId: z.string().min(1, "L'ID du journal est requis"),
  name: z.string().min(1, "Le nom de l'asset est requis").max(50),
  symbol: z.string().max(20).optional(),
  type: z.enum(["forex", "crypto", "stocks", "commodities"]).default("forex"),
});

// Validateur pour mettre à jour un asset
export const updateTradingAssetSchema = z.object({
  id: z.string().min(1, "L'ID de l'asset est requis"),
  name: z.string().min(1, "Le nom de l'asset est requis").max(50).optional(),
  symbol: z.string().max(20).optional(),
  type: z.enum(["forex", "crypto", "stocks", "commodities"]).optional(),
  isActive: z.boolean().optional(),
});

// Validateur pour créer une session de trading
export const createTradingSessionSchema = z.object({
  journalId: z.string().min(1, "L'ID du journal est requis"),
  name: z.string().min(1, "Le nom de la session est requis").max(100),
  description: z.string().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)").optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)").optional(),
  timezone: z.string().default("UTC"),
});

// Validateur pour mettre à jour une session de trading
export const updateTradingSessionSchema = z.object({
  id: z.string().min(1, "L'ID de la session est requis"),
  name: z.string().min(1, "Le nom de la session est requis").max(100).optional(),
  description: z.string().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)").optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)").optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Validateur pour créer un setup de trading
export const createTradingSetupSchema = z.object({
  journalId: z.string().min(1, "L'ID du journal est requis"),
  name: z.string().min(1, "Le nom du setup est requis").max(100),
  description: z.string().optional(),
  strategy: z.string().optional(),
  successRate: z.number().min(0).max(100).optional(),
});

// Validateur pour mettre à jour un setup de trading
export const updateTradingSetupSchema = z.object({
  id: z.string().min(1, "L'ID du setup est requis"),
  name: z.string().min(1, "Le nom du setup est requis").max(100).optional(),
  description: z.string().optional(),
  strategy: z.string().optional(),
  successRate: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

// Validateur pour créer un trade avancé
export const createAdvancedTradeSchema = z.object({
  journalId: z.string().min(1, "L'ID du journal est requis"),
  assetId: z.string().optional(),
  sessionId: z.string().optional(),
  setupId: z.string().optional(),
  
  tradeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
  symbol: z.string().max(50).optional(),
  
  // Gestion du risque
  riskInput: z.string().max(50).optional(),
  
  // Résultats
  profitLossPercentage: z.string().max(50).optional(),
  exitReason: z.enum(["TP", "BE", "SL", "Manual"]).optional(),
  
  // Liens et notes
  tradingviewLink: z.string().optional(),
  notes: z.string().optional(),
  
  // Métadonnées
  isClosed: z.boolean().default(false),
});

// Validateur pour mettre à jour un trade avancé
export const updateAdvancedTradeSchema = z.object({
  id: z.string().min(1, "L'ID du trade est requis"),
  assetId: z.string().optional(),
  sessionId: z.string().optional(),
  setupId: z.string().optional(),
  
  tradeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)").optional(),
  symbol: z.string().max(50).optional(),
  
  // Gestion du risque
  riskInput: z.string().max(50).optional(),
  
  // Résultats
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
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)").optional(),
  isClosed: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Validateur pour les statistiques de trading
export const tradingStatsSchema = z.object({
  journalId: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)").optional(),
}); 