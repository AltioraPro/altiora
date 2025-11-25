export interface ClosedTradeData {
    profitLossPercentage: string | null;
    profitLossAmount: string | null;
    tradeDate: Date | null;
    exitReason: string | null;
    journalId: string | null;
}

export interface JournalData {
    startingCapital: number;
    usePercentageCalculation: boolean;
}
