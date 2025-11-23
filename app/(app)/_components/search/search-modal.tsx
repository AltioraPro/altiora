"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { CommandDialog } from "@/components/ui/command";
import { useSearchStore } from "@/store/search";
import { Search } from "./search";
import { SearchFooter } from "./search-footer";

export function SearchModal() {
    const { isOpen, setOpen } = useSearchStore();

    useHotkeys(["meta+k", "ctrl+k"], () => setOpen(), {
        enableOnFormTags: true,
        preventDefault: true,
    });

    return (
        <CommandDialog
            className="m-0 h-fit w-full max-w-full select-text overflow-hidden rounded-none border border-neutral-800 bg-transparent p-0 md:max-w-[740px]"
            onOpenChange={setOpen}
            open={isOpen}
        >
            <div className="flex-1 overflow-hidden bg-background">
                <Search />
            </div>
            <SearchFooter />
        </CommandDialog>
    );
}
