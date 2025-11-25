interface AggregatedStatsRow {
    totalTrades: number;
    closedTrades: string | null;
    winningTrades: string | null;
    losingTrades: string | null;
    tpTrades: string | null;
    beTrades: string | null;
    slTrades: string | null;
    avgPnL: string | null;
    totalAmountPnL: string | null;
}

interface ExtractedStats {
    totalTrades: number;
    closedTradesCount: number;
    winningTradesCount: number;
    losingTradesCount: number;
    tpTradesCount: number;
    beTradesCount: number;
    slTradesCount: number;
    avgPnL: string | number;
    rawTotalAmountPnL: string | number;
}

export function extractAggregatedStats(
    aggregatedStats: AggregatedStatsRow[]
): ExtractedStats {
    const stats = aggregatedStats[0];
    return {
        totalTrades: stats?.totalTrades ?? 0,
        closedTradesCount: Number(stats?.closedTrades) || 0,
        winningTradesCount: Number(stats?.winningTrades) || 0,
        losingTradesCount: Number(stats?.losingTrades) || 0,
        tpTradesCount: Number(stats?.tpTrades) || 0,
        beTradesCount: Number(stats?.beTrades) || 0,
        slTradesCount: Number(stats?.slTrades) || 0,
        avgPnL: stats?.avgPnL || 0,
        rawTotalAmountPnL: stats?.totalAmountPnL || 0,
    };
}
