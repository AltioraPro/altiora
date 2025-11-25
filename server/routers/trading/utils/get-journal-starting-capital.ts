interface JournalRow {
    id: string;
    startingCapital: string | null;
    usePercentageCalculation: boolean;
}

export function getJournalStartingCapital(
    journal: JournalRow | null
): number | null {
    if (!(journal?.usePercentageCalculation && journal?.startingCapital)) {
        return null;
    }
    return Number.parseFloat(journal.startingCapital);
}
