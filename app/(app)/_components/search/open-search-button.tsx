"use client";

import { RiSearchLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useSearchStore } from "@/store/search";

export function OpenSearchButton() {
    const { setOpen } = useSearchStore();

    return (
        <Button
            className="no-drag relative hidden w-full min-w-[250px] justify-start border-0 p-0 font-normal text-muted-foreground text-sm hover:bg-transparent hover:text-foreground sm:pr-12 md:flex md:w-40 lg:w-64"
            onClick={() => setOpen()}
            variant="outline"
        >
            <RiSearchLine className="mr-2" size={18} />
            <span>Find anything...</span>
            <KbdGroup className="absolute top-1.5 right-1.5 hidden h-5 select-none items-center gap-1 px-1.5 font-medium sm:flex">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
            </KbdGroup>
        </Button>
    );
}
