import type { ClosedTradeData, JournalData } from "../types";

export function getTradeStartingCapital(
  trade: ClosedTradeData,
  journalsMap: Map<string, JournalData>,
  singleJournalId: string | null,
  singleJournalStartingCapital: number | null
): number | null {
  if (singleJournalId && singleJournalStartingCapital) {
    return singleJournalStartingCapital;
  }
  if (trade.journalId) {
    const tradeJournal = journalsMap.get(trade.journalId);
    if (tradeJournal) {
      return tradeJournal.startingCapital;
    }
  }
  return null;
}
