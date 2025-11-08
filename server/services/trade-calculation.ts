import type { TradingJournal } from "@/server/db/schema";

export interface TradeCalculationResult {
    profitLossPercentage: string;
    profitLossAmount?: string;
    exitReason: "TP" | "BE" | "SL" | "Manual";
}

export interface TradeCalculationInput {
    profitLossAmount?: string;
    profitLossPercentage?: string;
    exitReason?: "TP" | "BE" | "SL" | "Manual";
    breakEvenThreshold?: string;
}

export function calculateTradeResults(
    input: TradeCalculationInput,
    journal: TradingJournal
): TradeCalculationResult {
    if (!(journal.usePercentageCalculation && journal.startingCapital)) {
        return {
            profitLossPercentage: input.profitLossPercentage || "",
            profitLossAmount: input.profitLossAmount || "",
            exitReason: input.exitReason || "Manual",
        };
    }

    const startingCapital = Number.parseFloat(journal.startingCapital);

    let profitLossPercentage = 0;
    let profitLossAmount = 0;

    if (input.profitLossAmount) {
        profitLossAmount = Number.parseFloat(input.profitLossAmount);
        profitLossPercentage = (profitLossAmount / startingCapital) * 100;
    } else if (input.profitLossPercentage) {
        profitLossPercentage = Number.parseFloat(input.profitLossPercentage);
        profitLossAmount = (profitLossPercentage / 100) * startingCapital;
    }

    return {
        profitLossPercentage: profitLossPercentage.toString(),
        profitLossAmount: profitLossAmount.toString(),
        exitReason: input.exitReason || "Manual",
    };
}

export function validatePercentageCalculation(
    journal: TradingJournal
): boolean {
    return !!(
        journal.usePercentageCalculation &&
        journal.startingCapital &&
        Number.parseFloat(journal.startingCapital) > 0
    );
}

export function formatPercentage(value: string | number): string {
    const num = typeof value === "string" ? Number.parseFloat(value) : value;

    if (Number.isNaN(num)) {
        return "0.00%";
    }

    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
}

export function formatAmount(value: string | number, currency = "€"): string {
    const num = typeof value === "string" ? Number.parseFloat(value) : value;

    if (Number.isNaN(num)) {
        return `0.00${currency}`;
    }

    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}${currency}`;
}

export function getTradeColor(profitLossPercentage: string | number): string {
    const num =
        typeof profitLossPercentage === "string"
            ? Number.parseFloat(profitLossPercentage)
            : profitLossPercentage;

    if (Number.isNaN(num) || num === 0) {
        return "text-gray-500";
    }
    return num > 0 ? "text-green-600" : "text-red-600";
}

export function getExitReasonIcon(exitReason: string): string {
    switch (exitReason) {
        case "TP":
            return "🎯";
        case "BE":
            return "⚖️";
        case "SL":
            return "🛑";
        case "Manual":
            return "✋";
        default:
            return "📊";
    }
}

export function getExitReasonLabel(exitReason: string): string {
    switch (exitReason) {
        case "TP":
            return "Take Profit";
        case "BE":
            return "Break Even";
        case "SL":
            return "Stop Loss";
        case "Manual":
            return "Manuel";
        default:
            return "Inconnu";
    }
}
