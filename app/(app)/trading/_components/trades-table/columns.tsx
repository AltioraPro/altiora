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
                const profitLossPercentage = Number(
                    trade.profitLossPercentage || 0
                );
                const profitLossAmount = Number(trade.profitLossAmount || 0);
                const usePercentageCalculation =
                    stats?.journal?.usePercentageCalculation;

                return (
                    <div className="space-y-1">
                        <span
                            className={cn(
                                "text-sm",
                                profitLossPercentage > 0 && "text-green-400",
                                profitLossPercentage < 0 && "text-red-400",
                                profitLossPercentage === 0 && "text-blue-400"
                            )}
                        >
                            {profitLossPercentage >= 0 ? "+" : ""}
                            {trade.profitLossPercentage}%
                        </span>
                        {trade.profitLossAmount && usePercentageCalculation && (
                            <div
                                className={cn(
                                    "text-xs",
                                    profitLossAmount > 0 && "text-green-400",
                                    profitLossAmount < 0 && "text-red-400",
                                    profitLossAmount === 0 && "text-blue-400"
                                )}
                            >
                                {profitLossAmount >= 0 ? "+" : ""}
                                {trade.profitLossAmount}€
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
                const isClosed = row.original.isClosed;

                if (isClosed === false) {
                    return (
                        <Badge className="border-sky-500/30 bg-sky-500/20 text-sky-400 animate-pulse">
                            OPEN
                        </Badge>
                    );
                }

                const exitReason = row.original.exitReason;
                return getExitReasonBadge(exitReason);
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
