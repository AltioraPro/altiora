import { z } from "zod";

/**
 * Schema for MetaTrader webhook payload
 * Matches the JSON structure sent by TradeWebhook_MT4.mq4 and TradeWebhook_MT5.mq5
 */
export const metatraderWebhookPayloadSchema = z.object({
	// Authentication
	token: z.string().min(1, "Token is required"),

	// Trade identification
	ticket: z.number().int().positive("Ticket must be a positive integer"),
	position_id: z.number().int().positive("Position ID must be a positive integer"),

	// Trade details
	symbol: z.string().min(1, "Symbol is required"),
	type: z.enum(["buy", "sell", "other"]),
	volume: z.number().positive("Volume must be positive"),

	// Prices
	open_price: z.number().nonnegative(),
	close_price: z.number().nonnegative(),
	stop_loss: z.number().nonnegative().optional().default(0),
	stop_loss_amount: z.number().nonnegative().optional().default(0),

	// Financial results
	profit: z.number(), // Can be negative
	commission: z.number(), // Usually negative or zero
	swap: z.number(), // Can be positive or negative

	// Metadata
	comment: z.string().optional().default(""),
	magic: z.number().int().default(0),

	// Timestamps - Format: "2024.01.15 10:30:00" (MT server timezone)
	open_time: z.string().min(1, "Open time is required"),
	close_time: z.string().min(1, "Close time is required"),

	// Account information
	account: z.number().int().positive("Account number is required"),
	broker: z.string().min(1, "Broker name is required"),
	currency: z.string().min(1, "Currency is required"),

	// Platform identification (only present in MT4)
	platform: z.enum(["MT4", "MT5"]).optional(),
});

export type MetaTraderWebhookPayload = z.infer<typeof metatraderWebhookPayloadSchema>;

/**
 * Schema for generating a new webhook token
 */
export const generateWebhookTokenSchema = z.object({
	journalId: z.string().min(1, "Journal ID is required"),
	platform: z.enum(["mt4", "mt5"]),
});

export type GenerateWebhookTokenInput = z.infer<typeof generateWebhookTokenSchema>;

/**
 * Schema for getting MetaTrader setup info
 */
export const getSetupInfoSchema = z.object({
	journalId: z.string().min(1, "Journal ID is required"),
});

export type GetSetupInfoInput = z.infer<typeof getSetupInfoSchema>;

/**
 * Schema for regenerating webhook token
 */
export const regenerateTokenSchema = z.object({
	journalId: z.string().min(1, "Journal ID is required"),
});

export type RegenerateTokenInput = z.infer<typeof regenerateTokenSchema>;
