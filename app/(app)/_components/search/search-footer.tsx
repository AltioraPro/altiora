"use client";

import {
    RiArrowDownLine,
    RiArrowUpLine,
    RiCornerDownLeftLine,
} from "@remixicon/react";
import { Logo } from "@/components/logo";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

export function SearchFooter() {
    return (
        <div className="flex h-10 w-full items-center border-border border-t bg-background px-3">
            <div className="flex items-center">
                <Logo className="size-6 opacity-50" />
            </div>

            <KbdGroup className="ml-auto flex items-center gap-2">
                <Kbd>
                    <RiArrowUpLine className="h-3 w-3 text-muted-foreground" />
                </Kbd>
                <Kbd>
                    <RiArrowDownLine className="h-3 w-3 text-muted-foreground" />
                </Kbd>
                <Kbd>
                    {" "}
                    <RiCornerDownLeftLine className="h-3 w-3 text-muted-foreground" />{" "}
                </Kbd>
            </KbdGroup>
        </div>
    );
}
