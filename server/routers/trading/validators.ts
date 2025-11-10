import { z } from "zod";

export const createTradingJournalSchema = z.object({
    name: z.string().min(1, "Journal name is required").max(255),
    description: z.string().optional(),
    startingCapital: z.string().optional(),
    usePercentageCalculation: z.boolean(),
});

export const updateTradingJournalSchema = z.object({
    id: z.string().min(1, "Journal ID is required"),
    name: z.string().min(1, "Journal name is required").max(255).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    startingCapital: z.string().optional(),
    usePercentageCalculation: z.boolean().optional(),
});

export const createTradingAssetSchema = z.object({
    journalId: z.string().min(1, "Journal ID is required"),
    name: z.string().min(1, "Asset name is required").max(50),
    type: z.enum(["forex", "crypto", "stocks", "commodities"]).default("forex"),
});

export const updateTradingAssetSchema = z.object({
    id: z.string().min(1, "Asset ID is required"),
    name: z.string().min(1, "Asset name is required").max(50).optional(),
    type: z.enum(["forex", "crypto", "stocks", "commodities"]).optional(),
    isActive: z.boolean().optional(),
});

export const createTradingSessionSchema = z.object({
    journalId: z.string().min(1, "Journal ID is required"),
    name: z.string().min(1, "Session name is required").max(100),
    description: z.string().optional(),
    startTime: z
        .string()
        .regex(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Invalid time format (HH:MM)"
        )
        .optional(),
    endTime: z
        .string()
        .regex(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Invalid time format (HH:MM)"
        )
        .optional(),
    timezone: z.string().default("UTC"),
});

export const updateTradingSessionSchema = z.object({
    id: z.string().min(1, "Session ID is required"),
    name: z.string().min(1, "Session name is required").max(100).optional(),
    description: z.string().optional(),
    startTime: z
        .string()
        .regex(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Invalid time format (HH:MM)"
        )
        .optional(),
    endTime: z
        .string()
        .regex(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Invalid time format (HH:MM)"
        )
        .optional(),
    timezone: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const createTradingSetupSchema = z.object({
    journalId: z.string().min(1, "Journal ID is required"),
    name: z.string().min(1, "Setup name is required").max(100),
    description: z.string().optional(),
    strategy: z.string().optional(),
    successRate: z.number().min(0).max(100).optional(),
});

export const updateTradingSetupSchema = z.object({
    id: z.string().min(1, "Setup ID is required"),
    name: z.string().min(1, "Setup name is required").max(100).optional(),
    description: z.string().optional(),
    strategy: z.string().optional(),
    successRate: z.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
});

export const createAdvancedTradeSchema = z
    .object({
        journalId: z.string().min(1, "Journal ID is required"),
        assetId: z.string().min(1, "Asset ID is required"),
        sessionId: z.string().min(1, "Session ID is required").optional(),
        setupId: z.string().optional(),
        tradeDate: z.date(),
        riskInput: z.string().optional(),
        profitLossAmount: z.string().optional(),
        profitLossPercentage: z.string().optional(),
        exitReason: z.enum(["TP", "BE", "SL", "Manual"]),
        tradingviewLink: z.string().optional(),
        notes: z.string().optional(),
        isClosed: z.boolean(),
    })
    .refine(
        (data) =>
            (data.profitLossAmount && !data.profitLossAmount) ||
            (data.profitLossPercentage && !data.profitLossPercentage),
        {
            message: "Either profit/loss amount or percentage is required",
            path: ["profitLossAmount"],
        }
    );

export const updateAdvancedTradeSchema = z.object({
    id: z.string().min(1, "Trade ID is required"),
    assetId: z.string().optional(),
    sessionId: z.string().optional(),
    setupId: z.string().optional(),

    tradeDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
        .optional(),
    riskInput: z.string().optional(),
    profitLossAmount: z.string().optional(),
    profitLossPercentage: z.string().optional(),
    exitReason: z.enum(["TP", "BE", "SL", "Manual"]).optional(),

    tradingviewLink: z.string().optional(),
    notes: z.string().optional(),
    isClosed: z.boolean().optional(),
});

export const filterTradesSchema = z.object({
    journalId: z.string().optional(),
    journalIds: z.array(z.string()).optional(),
    assetId: z.string().optional(),
    assetIds: z.array(z.string()).optional(),
    sessionId: z.string().optional(),
    sessionIds: z.array(z.string()).optional(),
    setupId: z.string().optional(),
    setupIds: z.array(z.string()).optional(),
    symbol: z.string().optional(),
    startDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
        .optional(),
    endDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
        .optional(),
    isClosed: z.boolean().optional(),
    limit: z.number().min(1).default(50).optional(),
    offset: z.number().min(0).default(0),
});

export const tradingStatsSchema = z.object({
    journalId: z.string().optional(),
    journalIds: z.array(z.string()).optional(),
    assetIds: z.array(z.string()).optional(),
    sessionIds: z.array(z.string()).optional(),
    setupIds: z.array(z.string()).optional(),
    startDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
        .optional(),
    endDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
        .optional(),
});

export const reorderJournalsSchema = z.object({
    journalIds: z.array(z.string()).min(1, "At least one journal required"),
});

export const idSchema = z.object({
    id: z.string(),
});

export const journalIdSchema = z.object({
    journalId: z.string(),
});

export const journalOptionalIdSchema = z.object({
    journalId: z.string().optional(),
});

export const journalIdsSchema = z.object({
    journalId: z.string().optional(),
    journalIds: z.array(z.string()).optional(),
});

export const deleteMultipleTradesSchema = z.object({
    tradeIds: z.array(z.string()),
});

export type CreateTradingJournalInput = z.infer<
    typeof createTradingJournalSchema
>;
export type UpdateTradingJournalInput = z.infer<
    typeof updateTradingJournalSchema
>;
export type CreateTradingAssetInput = z.infer<typeof createTradingAssetSchema>;
export type UpdateTradingAssetInput = z.infer<typeof updateTradingAssetSchema>;
export type CreateTradingSessionInput = z.infer<
    typeof createTradingSessionSchema
>;
export type UpdateTradingSessionInput = z.infer<
    typeof updateTradingSessionSchema
>;
export type CreateTradingSetupInput = z.infer<typeof createTradingSetupSchema>;
export type UpdateTradingSetupInput = z.infer<typeof updateTradingSetupSchema>;
export type CreateAdvancedTradeInput = z.infer<
    typeof createAdvancedTradeSchema
>;
export type UpdateAdvancedTradeInput = z.infer<
    typeof updateAdvancedTradeSchema
>;
export type FilterTradesInput = z.infer<typeof filterTradesSchema>;
export type TradingStatsInput = z.infer<typeof tradingStatsSchema>;
