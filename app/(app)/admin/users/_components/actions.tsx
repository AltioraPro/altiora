import { RiMoreLine } from "@remixicon/react";
import type { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Item } from "./filters";

export default function RowActions({ row }: { row: Row<Item> }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    aria-label="Open menu"
                    className="h-8 w-8 p-0"
                    variant="ghost"
                >
                    <RiMoreLine className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => {
                        navigator.clipboard.writeText(row.original.email);
                    }}
                >
                    Copy email
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
