import { RiBarChartLine } from "@remixicon/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/constants/pages";
import { NewJournalButton } from "./new-journal-button";

export function JournalsHeader() {
    return (
        <div className="mb-6 flex items-center justify-end">
            <div className="flex items-center space-x-2">
                <Link href={PAGES.TRADING_CALENDAR}>
                    <Button
                        className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        variant="outline"
                    >
                        <RiBarChartLine className="mr-2 h-4 w-4" />
                        Calendar
                    </Button>
                </Link>
                <Link href={PAGES.DASHBOARD}>
                    <Button
                        className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        variant="outline"
                    >
                        <RiBarChartLine className="mr-2 h-4 w-4" />
                        Dashboard
                    </Button>
                </Link>
                <NewJournalButton />
            </div>
        </div>
    );
}
