import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/constants/pages";
import { NewJournalButton } from "./new-journal-button";

export function JournalsHeader() {
    return (
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="mb-2 font-argesta font-bold text-3xl text-white">
                    Trading Journals
                </h1>
                <p className="text-white/60">
                    Manage your trading journals and track performance
                </p>
            </div>

            <div className="flex items-center space-x-2">
                <Link href={PAGES.TRADING_CALENDAR}>
                    <Button
                        className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        variant="outline"
                    >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Calendar
                    </Button>
                </Link>
                <Link href={PAGES.DASHBOARD}>
                    <Button
                        className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        variant="outline"
                    >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                    </Button>
                </Link>
                <NewJournalButton />
            </div>
        </div>
    );
}
