"use client";

import { RiAddLine, RiBarChartLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyTradingStateProps {
    onCreateJournal: () => void;
    isCreating: boolean;
}

export function EmptyTradingState({
    onCreateJournal,
    isCreating,
}: EmptyTradingStateProps) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-2xl text-center">
                <div className="mb-8">
                    <h1 className="mb-4 font-argesta font-bold text-4xl text-white">
                        Trading Dashboard
                    </h1>
                    <p className="text-white/60">
                        Start your trading journey by creating your first
                        journal
                    </p>
                </div>

                <Card className="border border-white/10 bg-black/20 p-8">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                        <RiBarChartLine className="size-8 text-white/60" />
                    </div>
                    <h3 className="mb-4 text-white text-xl">
                        No Journal Created
                    </h3>
                    <p className="mb-8 text-white/60">
                        Create your first trading journal to start tracking your
                        performance.
                    </p>

                    <Button
                        className="bg-white text-black hover:bg-gray-200"
                        disabled={isCreating}
                        onClick={onCreateJournal}
                    >
                        <RiAddLine className="mr-2 size-4" />
                        Create First Journal
                    </Button>
                </Card>
            </div>
        </div>
    );
}
