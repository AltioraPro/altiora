"use client";

import { RiMenuLine } from "@remixicon/react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { MainMenu } from "./main-menu";

export function MobileMenu() {
    const [isOpen, setOpen] = useState(false);

    return (
        <Sheet onOpenChange={setOpen} open={isOpen}>
            <div>
                <Button
                    className="relative flex h-8 w-8 items-center rounded-full md:hidden"
                    onClick={() => setOpen(true)}
                    size="icon"
                    variant="outline"
                >
                    <RiMenuLine size={16} />
                </Button>
            </div>
            <SheetContent
                className="-ml-4 rounded-none border-none"
                side="left"
            >
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <div className="mb-8 ml-2">
                    <Logo />
                </div>

                <div className="-ml-2">
                    <MainMenu
                        isExpanded={true}
                        onSelect={() => setOpen(false)}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
