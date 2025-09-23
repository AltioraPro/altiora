import { TradingJournal } from "@/server/db/schema";

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
  journal: TradingJournal,
  currentCapital?: number
): TradeCalculationResult {
  if (!journal.usePercentageCalculation || !journal.startingCapital) {
    return {
      profitLossPercentage: input.profitLossPercentage || "0",
      profitLossAmount: input.profitLossAmount,
      exitReason: input.exitReason || "Manual",
    };
  }

  const startingCapital = parseFloat(journal.startingCapital);
  
  let profitLossPercentage: number = 0;
  let profitLossAmount: number = 0;

  if (input.profitLossAmount) {
    profitLossAmount = parseFloat(input.profitLossAmount);
    profitLossPercentage = (profitLossAmount / startingCapital) * 100;
  }
  else if (input.profitLossPercentage) {
    profitLossPercentage = parseFloat(input.profitLossPercentage);
    profitLossAmount = (profitLossPercentage / 100) * startingCapital;
  }

  return {
    profitLossPercentage: profitLossPercentage.toFixed(2),
    profitLossAmount: profitLossAmount.toFixed(2),
    exitReason: input.exitReason || "Manual",
  };
}

export function validatePercentageCalculation(journal: TradingJournal): boolean {
  return !!(
    journal.usePercentageCalculation &&
    journal.startingCapital &&
    parseFloat(journal.startingCapital) > 0
  );
}

export function formatPercentage(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00%";
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
}

export function formatAmount(value: string | number, currency = "€"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return `0.00${currency}`;
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}${currency}`;
}

export function getTradeColor(profitLossPercentage: string | number): string {
  const num = typeof profitLossPercentage === "string" ? parseFloat(profitLossPercentage) : profitLossPercentage;
  if (isNaN(num) || num === 0) return "text-gray-500";
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
