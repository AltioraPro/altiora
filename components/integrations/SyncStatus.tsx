"use client";

import { RiRefreshLine, RiCheckLine, RiCloseLine, RiLoader4Line } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SyncStatusProps {
    lastSyncedAt?: Date | string | null;
    syncStatus?: "success" | "error" | "pending" | null;
    isLoading?: boolean;
    onSync?: () => void;
}

export function SyncStatus({
    lastSyncedAt,
    syncStatus,
    isLoading = false,
    onSync,
}: SyncStatusProps) {
    const getStatusBadge = () => {
        if (isLoading) {
            return (
                <Badge variant="secondary" className="gap-1">
                    <RiLoader4Line className="h-3 w-3 animate-spin" />
                    Syncing...
                </Badge>
            );
        }

        switch (syncStatus) {
            case "success":
                return (
                    <Badge variant="default" className="gap-1 bg-green-500">
                        <RiCheckLine className="h-3 w-3" />
                        Synced
                    </Badge>
                );
            case "error":
                return (
                    <Badge variant="destructive" className="gap-1">
                        <RiCloseLine className="h-3 w-3" />
                        Error
                    </Badge>
                );
            case "pending":
                return (
                    <Badge variant="secondary" className="gap-1">
                        <RiLoader4Line className="h-3 w-3" />
                        Pending
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="gap-1">
                        Not synced
                    </Badge>
                );
        }
    };

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return "Never";
        const d = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(d);
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                {getStatusBadge()}
                <span className="text-xs text-muted-foreground">
                    {formatDate(lastSyncedAt)}
                </span>
            </div>

            {onSync && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onSync}
                    disabled={isLoading}
                    className="gap-1"
                >
                    <RiRefreshLine
                        className={cn("h-3 w-3", isLoading && "animate-spin")}
                    />
                    Sync Now
                </Button>
            )}
        </div>
    );
}
