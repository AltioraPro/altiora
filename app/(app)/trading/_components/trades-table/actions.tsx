"use client";

import {
    RiDeleteBinLine,
    RiEditLine,
    RiExternalLinkLine,
} from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import type { Row, Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/client";
import type { TradeItem } from "./columns";

interface RowActionsProps {
    row: Row<TradeItem>;
    table: Table<TradeItem>;
    onEdit: (trade: TradeItem) => void;
    journalId: string;
}

export default function RowActions({
    row,
    table,
    onEdit,
    journalId,
}: RowActionsProps) {
    const tradeId = row.original.id;

    const { mutate: deleteTrade, isPending: isDeleting } = useMutation(
        orpc.trading.deleteTrade.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getTrades.queryKey({ input: { journalId } }),
                    orpc.trading.getStats.queryKey({ input: { journalId } }),
                ],
            },
            onSuccess: () => {
                table.resetRowSelection();
            },
        })
    );

    const handleEdit = () => {
        onEdit(row.original);
    };

    const handleDelete = () => {
        deleteTrade({ id: tradeId });
    };

    const tradingviewLink = row.original.tradingviewLink;

    return (
        <div className="flex items-center space-x-1">
            <Button
                aria-label="Edit trade"
                className="h-8 w-8"
                onClick={handleEdit}
                size="sm"
                variant="ghost"
            >
                <RiEditLine className="h-4 w-4" />
            </Button>
            <Button
                aria-label="Delete trade"
                className="h-8 w-8 p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                disabled={isDeleting}
                onClick={handleDelete}
                size="sm"
                variant="ghost"
            >
                <RiDeleteBinLine className="size-4" />
            </Button>
            {tradingviewLink && (
                <a
                    href={tradingviewLink}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <Button
                        aria-label="Open TradingView link"
                        className="h-8 w-8 p-1 text-white/60 hover:bg-white/10 hover:text-white"
                        size="sm"
                        variant="ghost"
                    >
                        <RiExternalLinkLine className="h-4 w-4" />
                    </Button>
                </a>
            )}
        </div>
    );
}
