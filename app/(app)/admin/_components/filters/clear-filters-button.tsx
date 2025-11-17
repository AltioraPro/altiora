"use client";

import { RiCloseLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClearFiltersButtonProps {
    visible?: boolean;
    onClick: () => void;
}

export function ClearFiltersButton({
    visible = true,
    onClick,
}: ClearFiltersButtonProps) {
    return (
        <Button
            className={cn(visible ? "flex" : "hidden")}
            onClick={onClick}
            type="button"
            variant="outline"
        >
            <RiCloseLine className="mr-2 h-4 w-4" />
            Clear filters
        </Button>
    );
}
