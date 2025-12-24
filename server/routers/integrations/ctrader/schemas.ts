import { z } from "zod";

/**
 * Validation schemas for cTrader integration
 */

export const connectCTraderAccountSchema = z.object({
	journalId: z.string().min(1, "Journal ID is required"),
	brokerAccountId: z.string().min(1, "Broker account ID is required"),
	accountNumber: z.string().optional(),
	brokerName: z.string().optional(),
	currency: z.string().optional(),
	accountType: z.enum(["live", "demo"]).optional(),
});

export const syncCTraderPositionsSchema = z.object({
	journalId: z.string().min(1, "Journal ID is required"),
	forceRefresh: z.boolean().optional().default(false),
});

export const disconnectCTraderAccountSchema = z.object({
	journalId: z.string().min(1, "Journal ID is required"),
});

export const getCTraderAccountsSchema = z.object({
	// No params needed - uses OAuth token from session
});

export type ConnectCTraderAccountInput = z.infer<
	typeof connectCTraderAccountSchema
>;
export type SyncCTraderPositionsInput = z.infer<
	typeof syncCTraderPositionsSchema
>;
export type DisconnectCTraderAccountInput = z.infer<
	typeof disconnectCTraderAccountSchema
>;
export type GetCTraderAccountsInput = z.infer<typeof getCTraderAccountsSchema>;
