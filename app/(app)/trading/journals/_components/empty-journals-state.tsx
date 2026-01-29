"use client";

import { RiAddLine, RiBarChartLine, RiBookOpenLine } from "@remixicon/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCreateJournalStore } from "@/store/create-journal-store";

export function EmptyJournalsState() {
    const openCreateModal = useCreateJournalStore((state) => state.open);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
            <div className="max-w-sm text-center">
                {/* Icon */}
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/8">
                    <RiBookOpenLine className="size-6 text-white/40" />
                </div>

                {/* Text */}
                <h3 className="mb-2 font-medium text-lg text-white">
                    No journals yet
                </h3>
                <p className="mb-8 text-sm text-white/40 leading-relaxed">
                    Create your first trading journal to start tracking your
                    performance and analyzing your trades.
                </p>

                {/* Actions */}
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Button
                        onClick={openCreateModal}
                        className="h-10 bg-white px-5 text-black hover:bg-white/90"
                    >
                        <RiAddLine className="mr-2 size-4" />
                        Create Journal
                    </Button>

                    <Button
                        variant="ghost"
                        className="h-10 text-white/50 hover:bg-white/5 hover:text-white/70"
                        asChild
                    >
                        <Link href="/dashboard">
                            <RiBarChartLine className="mr-2 size-4" />
                            View Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
