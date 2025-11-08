"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/constants/pages";

interface TradingPageHeaderProps {
    journalName: string;
    journalDescription?: string;
}

export function TradingPageHeader({
    journalName,
    journalDescription,
}: TradingPageHeaderProps) {
    return (
        <div className="mb-6 flex items-center space-x-4">
            <Link href={PAGES.TRADING_JOURNALS}>
                <Button size="sm" variant="ghost">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Journals
                </Button>
            </Link>
            <div className="flex-1">
                <h1 className="font-argesta font-bold text-3xl text-white">
                    {journalName}
                </h1>
                {journalDescription && (
                    <p className="text-white/60">{journalDescription}</p>
                )}
            </div>
        </div>
    );
}
