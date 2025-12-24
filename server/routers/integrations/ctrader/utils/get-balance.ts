import { CTraderSocket } from "./ctrader-socket";

/**
 * Get account balance from cTrader
 * Uses ProtoOAReconcileReq which returns account balance
 */
export async function getAccountBalance(
	accessToken: string,
	accountId: string,
	isLive: boolean = true
): Promise<number> {
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
			{ ctidTraderAccountId, accessToken },
			"OpenApi.ProtoOAAccountAuthRes",
		);

		// 3. Get Trader Info (Balance)
		console.log(`[getAccountBalance] Fetching Trader info for balance...`);
		const response = await socket.request<any>(
			2121,
			{ ctidTraderAccountId, accessToken },
			"OpenApi.ProtoOATraderRes",
		);

		// ProtoOATraderRes contains trader object with balance (in cents)
		console.log(`[getAccountBalance] Raw response for ${accountId}:`, JSON.stringify(response));
		const balance = response.trader?.balance ? Number(response.trader.balance) / 100 : 0;
		console.log(`[getAccountBalance] Account ${accountId} balance: ${balance}€`);
		
		return balance;
	} catch (error) {
		console.error(`[getAccountBalance] Error:`, error);
		return 0;
	} finally {
		socket.disconnect();
	}
}
