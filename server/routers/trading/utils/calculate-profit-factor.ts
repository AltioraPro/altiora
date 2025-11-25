import type { ClosedTradeData, JournalData } from "../types";
import { getTradeAmount } from "./get-trade-amount";

interface ProfitFactorParams {
    trades: ClosedTradeData[];
    journalsMap: Map<string, JournalData>;
    singleJournalId: string | null;
    singleJournalStartingCapital: number | null;
}

export function calculateProfitFactor(params: ProfitFactorParams): number {
    const {
        trades,
        journalsMap,
        singleJournalId,
        singleJournalStartingCapital,
    } = params;
    let totalGains = 0;
    let totalLosses = 0;

    for (const trade of trades) {
        const amount = getTradeAmount(
            trade,
            journalsMap,
            singleJournalId,
            singleJournalStartingCapital
        );

        if (amount > 0) {
            totalGains += amount;
        } else if (amount < 0) {
            totalLosses += Math.abs(amount);
        }
    }

    return totalLosses > 0 ? totalGains / totalLosses : 0;
}

