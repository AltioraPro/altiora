import type { ClosedTradeData } from "../types";

export function calculateTotalPnL(
    trades: ClosedTradeData[],
    startingCapital: number | null,
    rawTotalAmountPnL: number
): { totalPnLPercentage: number; totalAmountPnL: number } {
    if (trades.length === 0) {
        return { totalPnLPercentage: 0, totalAmountPnL: 0 };
    }

    const totalPnLPercentage = trades.reduce((acc, trade) => {
        const pnlPercentage = trade.profitLossPercentage
            ? Number.parseFloat(trade.profitLossPercentage) || 0
            : 0;
        return acc + pnlPercentage;
    }, 0);

    const totalAmountPnL = startingCapital
        ? (totalPnLPercentage / 100) * startingCapital
        : rawTotalAmountPnL;

    return { totalPnLPercentage, totalAmountPnL };
}

