import type { JournalData } from "../types";

export function buildJournalsMap(
  journalsList: Array<{
    id: string;
    startingCapital: string | null;
    usePercentageCalculation: boolean;
  }>
): Map<string, JournalData> {
  const journalsMap = new Map<string, JournalData>();

  for (const j of journalsList) {
    if (j.startingCapital) {
      journalsMap.set(j.id, {
        startingCapital: Number.parseFloat(j.startingCapital),
        usePercentageCalculation: j.usePercentageCalculation,
      });
    }
  }

  return journalsMap;
}
