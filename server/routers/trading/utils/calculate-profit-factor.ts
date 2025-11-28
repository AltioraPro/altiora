import type { ClosedTradeData, JournalData } from "../types";
import { getTradeAmount } from "./get-trade-amount";

interface ProfitFactorParams {
  trades: ClosedTradeData[];
  journalsMap: Map<string, JournalData>;
  singleJournalId: string | null;
  singleJournalStartingCapital: number | null;
}

export function calculateProfitFactor(params: ProfitFactorParams): number {
  const { trades, journalsMap, singleJournalId, singleJournalStartingCapital } =
    params;
  let totalGains = 0;
  let totalLosses = 0;
  let hasAmounts = false;
  let totalGainPercentages = 0;
  let totalLossPercentages = 0;

  for (const trade of trades) {
    const amount = getTradeAmount(
      trade,
      journalsMap,
      singleJournalId,
      singleJournalStartingCapital
    );

    if (amount !== 0) {
      hasAmounts = true;
      if (amount > 0) {
        totalGains += amount;
      } else if (amount < 0) {
        totalLosses += Math.abs(amount);
      }
    } else if (trade.profitLossPercentage) {
      // Fallback : utiliser les pourcentages si les montants ne sont pas disponibles
      const pnlPercentage = Number.parseFloat(trade.profitLossPercentage) || 0;
      if (pnlPercentage > 0) {
        totalGainPercentages += pnlPercentage;
      } else if (pnlPercentage < 0) {
        totalLossPercentages += Math.abs(pnlPercentage);
      }
    }
  }

  // Si on a des montants, utiliser les montants
  if (hasAmounts) {
    if (totalLosses > 0) {
      return totalGains / totalLosses;
    }
    if (totalGains > 0) {
      return Number.POSITIVE_INFINITY;
    }
    return 0;
  }

  if (totalLossPercentages > 0) {
    return totalGainPercentages / totalLossPercentages;
  }
  if (totalGainPercentages > 0) {
    return Number.POSITIVE_INFINITY;
  }
  return 0;
}
