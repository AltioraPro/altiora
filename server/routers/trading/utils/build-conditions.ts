import { eq, gte, inArray, lte } from "drizzle-orm";
import { advancedTrades, tradingJournals } from "@/server/db/schema";

interface FilterInput {
    journalId?: string;
    journalIds?: string[];
    assetIds?: string[];
    sessionIds?: string[];
    startDate?: string;
    endDate?: string;
}

type WhereCondition = ReturnType<typeof eq>;

export function buildTradeWhereConditions(
    userId: string,
    input: FilterInput
): WhereCondition[] {
    const conditions: WhereCondition[] = [eq(advancedTrades.userId, userId)];

    if (input.journalId) {
        conditions.push(eq(advancedTrades.journalId, input.journalId));
    } else if (input.journalIds && input.journalIds.length > 0) {
        conditions.push(inArray(advancedTrades.journalId, input.journalIds));
    }

    if (input.assetIds && input.assetIds.length > 0) {
        conditions.push(inArray(advancedTrades.assetId, input.assetIds));
    }

    if (input.sessionIds && input.sessionIds.length > 0) {
        conditions.push(inArray(advancedTrades.sessionId, input.sessionIds));
    }

    if (input.startDate) {
        conditions.push(
            gte(advancedTrades.tradeDate, new Date(input.startDate))
        );
    }

    if (input.endDate) {
        conditions.push(lte(advancedTrades.tradeDate, new Date(input.endDate)));
    }

    return conditions;
}

export function buildJournalWhereConditions(
    userId: string,
    input: FilterInput
): WhereCondition[] {
    const conditions: WhereCondition[] = [eq(tradingJournals.userId, userId)];

    if (input.journalId) {
        conditions.push(eq(tradingJournals.id, input.journalId));
    } else if (input.journalIds && input.journalIds.length > 0) {
        conditions.push(inArray(tradingJournals.id, input.journalIds));
    }

    return conditions;
}
