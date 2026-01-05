import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { RouterOutput } from "@/orpc/client";
import RowActions from "./actions";

export type TradeItem = RouterOutput["trading"]["getTrades"][number];

interface ColumnsProps {
    assets?: RouterOutput["trading"]["getAssets"];
    sessions?: RouterOutput["trading"]["getSessions"];
    stats?: RouterOutput["trading"]["getStats"];
    onEdit: (trade: TradeItem) => void;
    journalId: string;
}

export const createColumns = ({
    assets,
    sessions,
    stats,
    onEdit,
    journalId,
}: ColumnsProps): ColumnDef<TradeItem>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    aria-label="Select all"
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    aria-label="Select row"
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                />
            ),
            size: 28,
            enableSorting: false,
            enableHiding: false,
        },
        {
            header: "Date",
            accessorKey: "tradeDate",
            cell: ({ row }) => {
                const tradeDate = row.original.tradeDate;
                const date =
                    tradeDate instanceof Date
                        ? tradeDate
                        : parseISO(String(tradeDate));
                return (
                    <span className="text-sm text-white">
                        {format(date, "dd/MM/yyyy")}
                    </span>
                );
            },
            size: 120,
        },
        {
            header: "Asset",
            accessorKey: "assetId",
            cell: ({ row }) => {
                const assetId = row.original.assetId;
                const asset = assets?.find((a) => a.id === assetId);
                return (
                    <span className="text-sm text-white">{asset?.name || "-"}</span>
                );
            },
            size: 120,
        },
        {
            header: "Session",
            accessorKey: "sessionId",
            cell: ({ row }) => {
                const sessionId = row.original.sessionId;
                const session = sessions?.find((s) => s.id === sessionId);
                return (
                    <span className="text-sm text-white">
                        {session?.name || "-"}
                    </span>
                );
            },
            size: 120,
        },
        {
            header: "Confirmation",
            accessorKey: "confirmationId",
            cell: ({ row }) => {
                const confirmations = row.original.tradesConfirmations;

                return (
                    <span className="text-sm text-white">
                        {confirmations
                            .map((confirmation) => confirmation.confirmations.name)
                            .join(", ") || "-"}
                    </span>
                );
            },
            size: 140,
        },
        {
            header: "Risk",
            accessorKey: "riskInput",
            cell: ({ row }) => {
                const riskInput = row.original.riskInput;
                return (
                    <span className="text-sm text-white">{riskInput || "-"}</span>
                );
            },
            size: 100,
        },
        {
            header: "Result",
            accessorKey: "profitLossPercentage",
            cell: ({ row }) => {
                const trade = row.original;
                const profitLossAmount = Number(trade.profitLossAmount || 0);
                const usePercentageCalculation =
                    stats?.journal?.usePercentageCalculation;
                const startingCapital = Number(stats?.journal?.startingCapital || 0);

                // Check broker connection info for demo/live account
                const brokerConnection = trade.brokerConnection;
                // Default to demo if no broker connection (safer for privacy)
                const isDemo = !brokerConnection || brokerConnection.accountType === "demo";
                const currency = brokerConnection?.currency || "EUR";

                // Calculate percentage if missing but amount exists
                let profitLossPercentage = Number(trade.profitLossPercentage || 0);
                const hasPercentage = trade.profitLossPercentage !== null && trade.profitLossPercentage !== undefined && trade.profitLossPercentage !== "";

                // If no percentage but we have amount and capital, calculate it
                if (!hasPercentage && profitLossAmount !== 0 && startingCapital > 0) {
                    profitLossPercentage = (profitLossAmount / startingCapital) * 100;
                }

                // Break-Even threshold: trades between -0.10% and +1% are considered BE
                const BE_THRESHOLD_LOW = -0.10;
                const BE_THRESHOLD_HIGH = 1;
                const isBreakEven = profitLossPercentage >= BE_THRESHOLD_LOW && profitLossPercentage <= BE_THRESHOLD_HIGH;
                const isWin = profitLossPercentage > BE_THRESHOLD_HIGH;
                const isLoss = profitLossPercentage < BE_THRESHOLD_LOW;

                // Get currency symbol
                const getCurrencySymbol = (curr: string) => {
                    const symbols: Record<string, string> = {
                        USD: "$",
                        EUR: "€",
                        GBP: "£",
                        JPY: "¥",
                        CHF: "CHF",
                        AUD: "$",
                        CAD: "$",
                    };
                    return symbols[curr] || curr;
                };

                // Format display percentage
                const displayPercentage = hasPercentage
                    ? trade.profitLossPercentage
                    : profitLossPercentage.toFixed(2);

                return (
                    <div className="space-y-1">
                        <span
                            className={cn(
                                "text-sm",
                                isWin && "text-green-400",
                                isLoss && "text-red-400",
                                isBreakEven && "text-blue-400"
                            )}
                        >
                            {profitLossPercentage >= 0 ? "+" : ""}
                            {displayPercentage}%
                        </span>
                        {/* Show amount only for LIVE accounts */}
                        {!isDemo && profitLossAmount !== 0 && usePercentageCalculation && (
                            <div
                                className={cn(
                                    "text-xs",
                                    isWin && "text-green-400",
                                    isLoss && "text-red-400",
                                    isBreakEven && "text-blue-400"
                                )}
                            >
                                {profitLossAmount >= 0 ? "+" : ""}
                                {profitLossAmount.toFixed(2)}{getCurrencySymbol(currency)}
                            </div>
                        )}
                    </div>
                );
            },
            size: 120,
        },
        {
            header: "Exit",
            accessorKey: "exitReason",
            cell: ({ row }) => {
                const trade = row.original;
                const isClosed = trade.isClosed;

                if (isClosed === false) {
                    return (
                        <Badge className="border-sky-500/30 bg-sky-500/20 text-sky-400 animate-pulse">
                            OPEN
                        </Badge>
                    );
                }

                // Calculate percentage - use stored value or calculate from amount
                const profitLossAmount = Number(trade.profitLossAmount || 0);
                const startingCapital = Number(stats?.journal?.startingCapital || 0);
                const hasPercentage = trade.profitLossPercentage !== null && trade.profitLossPercentage !== undefined && trade.profitLossPercentage !== "";

                let profitLossPercentage = Number(trade.profitLossPercentage || 0);
                if (!hasPercentage && profitLossAmount !== 0 && startingCapital > 0) {
                    profitLossPercentage = (profitLossAmount / startingCapital) * 100;
                }

                // Check if trade is within BE threshold (-0.10% to +1%)
                const BE_THRESHOLD_LOW = -0.10;
                const BE_THRESHOLD_HIGH = 1;
                const isBreakEven = profitLossPercentage >= BE_THRESHOLD_LOW && profitLossPercentage <= BE_THRESHOLD_HIGH;

                // If within BE threshold, always show BE regardless of stored exitReason
                if (isBreakEven) {
                    return (
                        <Badge className="border-blue-500/30 bg-blue-500/20 text-blue-400">
                            BE
                        </Badge>
                    );
                }

                // Otherwise, use stored exitReason or derive from P&L
                const exitReason = trade.exitReason;
                if (exitReason) {
                    return getExitReasonBadge(exitReason);
                }

                // Derive from P&L if no exitReason stored
                return profitLossPercentage > 0
                    ? getExitReasonBadge("TP")
                    : getExitReasonBadge("SL");
            },
            size: 100,
        },
        {
            header: "Notes",
            accessorKey: "notes",
            cell: ({ row }) => {
                const notes = row.original.notes;
                if (!notes) {
                    return <span className="text-sm text-white/70">-</span>;
                }
                return (
                    <div
                        className="max-w-[150px] truncate text-sm text-white/70"
                        title={notes}
                    >
                        {notes.length > 30 ? `${notes.substring(0, 30)}...` : notes}
                    </div>
                );
            },
            size: 150,
        },
        {
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row, table }) => (
                <RowActions
                    journalId={journalId}
                    onEdit={onEdit}
                    row={row}
                    table={table}
                />
            ),
            size: 100,
            enableHiding: false,
        },
    ];

function getExitReasonBadge(exitReason: string | null) {
    switch (exitReason) {
        case "TP":
            return (
                <Badge className="border-green-500/30 bg-green-500/20 text-green-400">
                    TP
                </Badge>
            );
        case "BE":
            return (
                <Badge className="border-blue-500/30 bg-blue-500/20 text-blue-400">
                    BE
                </Badge>
            );
        case "SL":
            return (
                <Badge className="border-red-500/30 bg-red-500/20 text-red-400">
                    SL
                </Badge>
            );
        case "Manual":
            return (
                <Badge className="border-gray-500/30 bg-gray-500/20 text-gray-400">
                    Manual
                </Badge>
            );
        default:
            return (
                <Badge className="border-gray-500/30 bg-gray-500/20 text-gray-400">
                    -
                </Badge>
            );
    }
}
