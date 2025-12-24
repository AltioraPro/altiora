"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TradeBadgeProps {
    source: "manual" | "ctrader" | "metatrader";
    className?: string;
}

const SOURCE_CONFIG = {
    manual: {
        label: "Manual",
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
    ctrader: {
        label: "cTrader",
        variant: "default" as const,
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    metatrader: {
        label: "MetaTrader",
        variant: "default" as const,
        className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
};

export function TradeBadge({ source, className }: TradeBadgeProps) {
    const config = SOURCE_CONFIG[source];

    return (
        <Badge
            variant={config.variant}
            className={cn(
                "text-xs font-medium px-2 py-0.5",
                config.className,
                className,
            )}
        >
            {config.label}
        </Badge>
    );
}
