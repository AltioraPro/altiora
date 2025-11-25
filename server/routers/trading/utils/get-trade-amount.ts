import type { ClosedTradeData, JournalData } from "../types";
import { getTradeStartingCapital } from "./get-trade-starting-capital";

export function getTradeAmount(
    trade: ClosedTradeData,
    journalsMap: Map<string, JournalData>,
    singleJournalId: string | null,
    singleJournalStartingCapital: number | null
): number {
    if (trade.profitLossAmount) {
        return Number.parseFloat(trade.profitLossAmount) || 0;
    }

    if (!(trade.profitLossPercentage && trade.journalId)) {
        return 0;
    }

    const tradeStartingCapital = getTradeStartingCapital(
        trade,
        journalsMap,
        singleJournalId,
        singleJournalStartingCapital
    );

    if (!tradeStartingCapital) {
        return 0;
    }

    const pnlPercentage = Number.parseFloat(trade.profitLossPercentage) || 0;
    return (pnlPercentage / 100) * tradeStartingCapital;
}
