"use client";

import { BarChart3, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCreateJournalStore } from "@/stores/create-journal-store";

export function EmptyJournalsState() {
    const openCreateModal = useCreateJournalStore((state) => state.open);

    return (
        <div className="py-12 text-center">
            <Card className="mx-auto max-w-md border border-white/10 bg-black/20 p-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                    <BookOpen className="h-8 w-8 text-white/60" />
                </div>

                <h3 className="mb-4 text-white text-xl">No Journals Created</h3>
                <p className="mb-8 text-white/60">
                    Create your first trading journal to start tracking your
                    performance.
                </p>

                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                        className="bg-white text-black hover:bg-gray-200"
                        onClick={openCreateModal}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Journal
                    </Button>

                    <Link href="/dashboard">
                        <Button
                            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                            variant="outline"
                        >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Dashboard
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
