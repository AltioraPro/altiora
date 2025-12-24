/**
 * cTrader Open API Client
 * Provides methods to interact with cTrader's REST API
 * Documentation: https://help.ctrader.com/open-api/
 */

import { CTraderSocket } from "./ctrader-socket";

export interface CTraderAccount {
	accountId: string;
	accountNumber: string;
	brokerName: string;
	balance: number;
	currency: string;
	isLive: boolean;
	leverage: number;
	createdAt: string;
}

export interface CTraderPosition {
	positionId: string;
	accountId: string;
	symbol: string;
	tradeSide: "BUY" | "SELL";
	volume: number; // in units
	entryPrice: number;
	currentPrice?: number;
	swap: number;
	commission: number;
	openTimestamp: string;
	profitLoss: number;
	pips?: number;
	stopLoss?: number; // Price level for stop loss
	takeProfit?: number; // Price level for take profit
}

export interface CTraderDeal {
	dealId: string;
	positionId: string;
	accountId: string;
	symbol: string;
	tradeSide: "BUY" | "SELL";
	volume: number;
	executionPrice: number;
	commission: number;
	swap: number;
	profit: number;
	executionTime: string;
	stopLoss?: number; // SL price (might be in opening deal)
	takeProfit?: number; // TP price (might be in opening deal)
	closePositionDetail?: {
		closedVolume: number;
		balance: number;
	};
}

export interface CTraderApiError {
	errorCode: string;
	description: string;
}

export class CTraderClient {
	private baseUrl = "https://api.spotware.com/connect";
	private accessToken: string;

	constructor(accessToken: string) {
		this.accessToken = accessToken;
	}

	/**
	 * Get all accounts associated with the authenticated user
     * Uses WebSocket/Protobuf to fetch the real ctidTraderAccountIds
	 */
	async getAccountList(): Promise<CTraderAccount[]> {
        const socket = new CTraderSocket();
		try {
			await socket.connect();

			// 1. App Auth
			const clientId = process.env.CTRADER_CLIENT_ID;
			const clientSecret = process.env.CTRADER_CLIENT_SECRET;
			if (!clientId || !clientSecret) {
				throw new Error("Missing cTrader Client ID or Secret");
			}
			await socket.request(2100, { clientId, clientSecret }, "OpenApi.ProtoOAApplicationAuthRes");

            // 2. Get Account List
            const response = await socket.request<any>(
                2149,
                { accessToken: this.accessToken },
                "OpenApi.ProtoOAGetAccountListByAccessTokenRes"
            );

            // response.ctidTraderAccount is an array of accounts
            return (response.ctidTraderAccount || []).map((acc: any) => ({
                accountId: acc.ctidTraderAccountId.toString(),
                accountNumber: acc.ctidTraderAccountId.toString(), // We don't get the number here? 
                brokerName: "cTrader", // Unknown from this call
                balance: 0, // Need to fetch details
                currency: "UNKNOWN", // Unknown
                isLive: acc.isLive,
                leverage: 1, // Unknown
                createdAt: new Date().toISOString()
            }));

		} catch (error) {
			console.error(`[CTraderClient] Error fetching account list:`, error);
            return [];
		} finally {
            socket.disconnect();
        }
	}
	async getAccounts(): Promise<CTraderAccount[]> {
		try {
			const response = await fetch(`${this.baseUrl}/v1/accounts`, {
				method: "GET",
				headers: this.getHeaders(),
			});

			await this.handleErrorResponse(response);

			const data = await response.json();
			return data.accounts || [];
		} catch (error) {
			throw this.handleError(error, "Failed to fetch cTrader accounts");
		}
	}

	/**
	 * Get open positions for a specific account
	 * @param accountId - The cTrader account ID
	 */
	async getOpenPositions(accountId: string, isLive: boolean = true): Promise<CTraderPosition[]> {
		const socket = new CTraderSocket(isLive);
		try {
			await socket.connect();

			// 1. App Auth
			const clientId = process.env.CTRADER_CLIENT_ID;
			const clientSecret = process.env.CTRADER_CLIENT_SECRET;
			if (!clientId || !clientSecret) {
				throw new Error("Missing cTrader Client ID or Secret");
			}
			console.log("[CTraderClient] Authenticating App...");
			await socket.request(2100, { clientId, clientSecret }, "OpenApi.ProtoOAApplicationAuthRes");

			// 2. Account Auth
			const ctidTraderAccountId = parseInt(accountId, 10);
			if (isNaN(ctidTraderAccountId)) {
				// accountId might be string, but CTrader uses int64. If it's the ctid, it should be parseable.
				// If it's a GUID or string from Connect, we might need to fetch the list first? 
				// The auth flow returns account ID. Let's assume the passed accountId IS the ctidTraderAccountId.
			}
			console.log(`[CTraderClient] Authenticating Account ${accountId}...`);
			await socket.request(
				2102,
				{ ctidTraderAccountId, accessToken: this.accessToken },
				"OpenApi.ProtoOAAccountAuthRes",
			);

			// 3. Reconcile (Get Positions)
			console.log(`[CTraderClient] Requesting Positions...`);
			const response = await socket.request<any>(
				2124,
				{ ctidTraderAccountId },
				"OpenApi.ProtoOAReconcileRes",
			);

			const positions = response.position || [];
			console.log(`[CTraderClient] Received ${positions.length} positions`);

			// 4. Fetch Current Prices (Estimate P&L)
			const distinctSymbols = [...new Set(positions.map((p: any) => p.tradeData.symbolId))];
			const prices = new Map<string, number>();
			
			console.log(`[CTraderClient] Fetching prices for ${distinctSymbols.length} symbols...`);
			
			for (const symbolId of distinctSymbols) {
				try {
					const trendbars = await socket.request<any>(
						2137,
						{
							ctidTraderAccountId,
							fromTimestamp: Date.now() - 48 * 60 * 60 * 1000, // Last 48h to be sure
							toTimestamp: Date.now(),
							period: 1, // M1
							symbolId: Number(symbolId)
						},
						"OpenApi.ProtoOAGetTrendbarsRes"
					);
					
					if (trendbars.trendbar && trendbars.trendbar.length > 0) {
						const lastBar = trendbars.trendbar[trendbars.trendbar.length - 1];
						const low = Number(lastBar.low || 0);
						const close = low + Number(lastBar.deltaClose || 0);
						
						if (close > 0) {
							prices.set(symbolId.toString(), close);
						}
					} else {
                        console.log(`[CTraderClient] No trendbars found for symbol ${symbolId} in last 48h`);
                    }
				} catch (e) {
					console.warn(`[CTraderClient] Failed to fetch price for symbol ${symbolId}`, e);
				}
			}
            
            console.log(`[CTraderClient] Prices fetched:`, Object.fromEntries(prices));

			// Map ProtoOAPosition to CTraderPosition interface
			return positions.map((p: any) => {
				const symbolId = p.tradeData?.symbolId?.toString() || "Unknown";
				const currentPrice = prices.get(symbolId) || p.price || 0;
				const entryPrice = p.price || 0;
				const tradeSide = p.tradeData?.tradeSide === 1 ? "BUY" : "SELL";
				const volume = p.tradeData?.volume ? Number(p.tradeData.volume) / 100 : 0; 

				let estimatedPnL = 0;
				if (currentPrice > 0 && entryPrice > 0 && volume > 0) {
                    const diff = currentPrice - entryPrice;
                    // Raw estimation: diff * volume. 
                    // Note: This ignores TickValue and Currency Conversion. 
                    // It produces a raw number in Quote Currency terms (usually).
                    // For EURUSD, it is USD. Account is EUR. Close enough for visual indicative.
                    estimatedPnL = diff * volume * (tradeSide === "BUY" ? 1 : -1);
                }

                return {
                    positionId: p.positionId.toString(),
                    accountId: accountId,
                    symbol: symbolId,
                    tradeSide: tradeSide,
                    volume: volume,
                    entryPrice: entryPrice,
                    currentPrice: currentPrice,
                    swap: p.swap ? Number(p.swap) / 100 : 0,
                    commission: p.commission ? Number(p.commission) / 100 : 0,
                    openTimestamp: p.tradeData?.openTimestamp ? new Date(Number(p.tradeData.openTimestamp)).toISOString() : new Date().toISOString(),
                    profitLoss: estimatedPnL, // Set estimated P&L
                    stopLoss: p.stopLoss ? Number(p.stopLoss) : undefined,
                    takeProfit: p.takeProfit ? Number(p.takeProfit) : undefined,
				};
			});

		} catch (error) {
			console.error(`[CTraderClient] Error fetching open positions:`, error);
			// Fail gracefully
			return [];
		} finally {
			socket.disconnect();
		}
	}

	/**
	 * Get deal history for a specific account
	 * @param accountId - The cTrader account ID
	 * @param from - Start timestamp (ISO 8601)
	 * @param to - End timestamp (ISO 8601)
	 */
	async getDealHistory(
		accountId: string,
		from?: string,
		to?: string,
		isLive: boolean = true,
	): Promise<CTraderDeal[]> {
		const socket = new CTraderSocket(isLive);
		try {
			await socket.connect();

			// 1. App Auth
			const clientId = process.env.CTRADER_CLIENT_ID;
			const clientSecret = process.env.CTRADER_CLIENT_SECRET;
			if (!clientId || !clientSecret) {
				throw new Error("Missing cTrader Client ID or Secret");
			}
			await socket.request(2100, { clientId, clientSecret }, "OpenApi.ProtoOAApplicationAuthRes");

			// 2. Account Auth
			const ctidTraderAccountId = parseInt(accountId, 10);
            
			await socket.request(
				2102,
				{ ctidTraderAccountId, accessToken: this.accessToken },
				"OpenApi.ProtoOAAccountAuthRes",
			);

			// 3. Deal List
			console.log(`[CTraderClient] Requesting Deal History...`);
            const fromTimestamp = from ? new Date(from).getTime() : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).getTime();
            const toTimestamp = to ? new Date(to).getTime() : Date.now();
            
			const response = await socket.request<any>(
				2133,
				{ 
                    ctidTraderAccountId,
                    fromTimestamp,
                    toTimestamp,
                    maxRows: 50 // Limit for now
                },
				"OpenApi.ProtoOADealListRes",
			);

            const deals = response.deal || [];
            console.log(`[CTraderClient] Received ${deals.length} deals`);

            return deals.map((d: any) => ({
                dealId: d.dealId.toString(),
                positionId: d.positionId.toString(),
                accountId: accountId,
                symbol: d.symbolId?.toString() || "Unknown",
                tradeSide: d.tradeSide === 1 ? "BUY" : "SELL",
                volume: d.volume ? Number(d.volume) / 100 : 0,
                executionPrice: d.executionPrice || 0,
                commission: d.commission ? Number(d.commission) / 100 : 0,
                swap: d.closePositionDetail?.swap ? Number(d.closePositionDetail.swap) / 100 : 0,
                profit: d.closePositionDetail?.grossProfit ? Number(d.closePositionDetail.grossProfit) / 100 : 0,
                executionTime: d.executionTimestamp ? new Date(Number(d.executionTimestamp)).toISOString() : new Date().toISOString(),
                stopLoss: d.stopLoss ? Number(d.stopLoss) : undefined,
                takeProfit: d.takeProfit ? Number(d.takeProfit) : undefined,
                closePositionDetail: d.closePositionDetail ? {
                    closedVolume: d.closePositionDetail.closedVolume ? Number(d.closePositionDetail.closedVolume) / 100 : 0,
                    balance: d.closePositionDetail.balance ? Number(d.closePositionDetail.balance) / 100 : 0,
                } : undefined,
            }));

		} catch (error) {
			console.error(`[CTraderClient] Error fetching deal history:`, error);
			// Fail gracefully
			return [];
		} finally {
            socket.disconnect();
        }
	}

	/**
	 * Get account details
	 * @param accountId - The cTrader account ID
	 */
	async getAccountDetails(accountId: string): Promise<CTraderAccount> {
		try {
			const response = await fetch(
				`${this.baseUrl}/v1/accounts/${accountId}`,
				{
					method: "GET",
					headers: this.getHeaders(),
				},
			);

			await this.handleErrorResponse(response);

			const data = await response.json();
			return data;
		} catch (error) {
			throw this.handleError(
				error,
				`Failed to fetch account details for ${accountId}`,
			);
		}
	}

	/**
	 * Build request headers with authentication
	 */
	private getHeaders(): HeadersInit {
		return {
			Authorization: `Bearer ${this.accessToken}`,
			"Content-Type": "application/json",
			Accept: "application/json",
		};
	}

	/**
	 * Handle HTTP error responses
	 */
	private async handleErrorResponse(response: Response): Promise<void> {
		if (!response.ok) {
			const status = response.status;
			const statusText = response.statusText;
			let errorMessage = `HTTP ${status}: ${statusText}`;
			let errorBody = "";

			try {
				// Try to read as JSON
				const text = await response.text();
				errorBody = text;
				const errorData: CTraderApiError = JSON.parse(text);
				if (errorData.errorCode) {
					errorMessage = `${errorData.errorCode}: ${errorData.description}`;
				}
			} catch {
				// Fallback if not JSON
				if (errorBody) {
					errorMessage += ` - Body: ${errorBody.substring(0, 200)}`;
				}
			}

			console.error(`[CTraderClient] HTTP Error: ${errorMessage}`);
			throw new Error(errorMessage);
		}
	}

	/**
	 * Handle and format errors
	 */
	private handleError(error: unknown, context: string): Error {
		if (error instanceof Error) {
			return new Error(`${context}: ${error.message}`);
		}
		return new Error(`${context}: ${String(error)}`);
	}
}

/**
 * Map cTrader trade side to internal format
 */
export function mapCTraderTradeSide(
	tradeSide: "BUY" | "SELL",
): "BUY" | "SELL" {
	return tradeSide;
}

/**
 * Calculate profit/loss percentage
 */
export function calculateProfitLossPercentage(
	profitLoss: number,
	volume: number,
	entryPrice: number,
): number {
	if (volume === 0 || entryPrice === 0) return 0;
	const investment = volume * entryPrice;
	return (profitLoss / investment) * 100;
}
