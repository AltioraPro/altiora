"use client";

import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
    category: { name: string; color: string; icon?: string | null };
    size?: "sm" | "md";
    className?: string;
}

export function CategoryBadge({
    category,
    size = "sm",
    className,
}: CategoryBadgeProps): React.JSX.Element {
    return (
        <span
            className={cn(
                "gap-1.5 px-2 py-0.5 font-medium max-w-full",
                size === "sm" && "text-xs",
                size === "md" && "text-sm",
                className
            )}
            style={{
                backgroundColor: `${category.color}15`,
                color: category.color,
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: `${category.color}30`,
            }}
        >
            <div className="flex items-center justify-center gap-1.5">
                <div
                    className="size-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: category.color }}
                />
                <span className="leading-none truncate">{category.name}</span>
            </div>
        </span>
    );
}
