"use client";

import { Badge } from "@/components/ui/badge";

export function LastUsedBadge() {
    return (
        <Badge className="-top-1/6 -right-2 absolute" variant="info">
            Last used
        </Badge>
    );
}
