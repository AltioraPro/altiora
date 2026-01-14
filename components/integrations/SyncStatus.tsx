"use client";

import {
    RiCheckLine,
    RiCloseLine,
    RiLoader4Line,
    RiRefreshLine,
} from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
                <Badge className="gap-1" variant="secondary">
                    <RiLoader4Line className="h-3 w-3 animate-spin" />
                    Syncing...
                </Badge>
            );
        }

        switch (syncStatus) {
            case "success":
                return (
                    <Badge className="gap-1 bg-green-500" variant="success">
                        <RiCheckLine className="h-3 w-3" />
                        Synced
                    </Badge>
                );
            case "error":
                return (
                    <Badge className="gap-1" variant="destructive">
                        <RiCloseLine className="h-3 w-3" />
                        Error
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="gap-1" variant="secondary">
                        <RiLoader4Line className="h-3 w-3" />
                        Pending
                    </Badge>
                );
            default:
                return (
                    <Badge className="gap-1" variant="outline">
                        Not synced
                    </Badge>
                );
        }
    };

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) {
            return "Never";
        }
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
                <span className="text-muted-foreground text-xs">
                    {formatDate(lastSyncedAt)}
                </span>
            </div>

            {onSync && (
                <Button
                    className="gap-1"
                    disabled={isLoading}
                    onClick={onSync}
                    size="sm"
                    variant="outline"
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
