"use client";

import { BarChart3, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreateJournalModal } from "@/components/trading/CreateJournalModal";
import { DraggableJournalList } from "@/components/trading/DraggableJournalList";
import { EditJournalModal } from "@/components/trading/EditJournalModal";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { TradingJournal } from "@/server/db/schema";
import { api } from "@/trpc/client";

export default function JournalsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    type EditingJournal = Pick<
        TradingJournal,
        "id" | "name" | "description"
    > | null;
    const [editingJournal, setEditingJournal] = useState<EditingJournal>(null);

    const {
        data: journals,
        isLoading: journalsLoading,
        refetch: refetchJournals,
    } = api.trading.getJournals.useQuery();

    const deleteJournalMutation = api.trading.deleteJournal.useMutation({
        onSuccess: () => {
            refetchJournals();
        },
    });

    const reorderJournalsMutation = api.trading.reorderJournals.useMutation({});

    const handleDeleteJournal = async (journalId: string) => {
        if (
            confirm(
                "Are you sure you want to delete this journal? This action is irreversible."
            )
        ) {
            try {
                await deleteJournalMutation.mutateAsync({ id: journalId });
            } catch (error) {
                console.error("Error deleting journal:", error);
            }
        }
    };

    const handleReorderJournals = async (journalIds: string[]) => {
        try {
            await reorderJournalsMutation.mutateAsync({ journalIds });
        } catch (error) {
            console.error("Error reordering journals:", error);
        }
    };

    if (journalsLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="mb-6 h-8 w-1/4 rounded bg-gray-200" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <div
                                className="h-64 rounded-lg bg-gray-200"
                                key={i}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
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
                    <Link href="/trading/calendar">
                        <Button
                            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                            variant="outline"
                        >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Calendar
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button
                            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                            variant="outline"
                        >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <Button
                        className="bg-white text-black hover:bg-gray-200"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Journal
                    </Button>
                </div>
            </div>

            {!journals || journals.length === 0 ? (
                <div className="py-12 text-center">
                    <Card className="mx-auto max-w-md border border-white/10 bg-black/20 p-8">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                            <BookOpen className="h-8 w-8 text-white/60" />
                        </div>

                        <h3 className="mb-4 text-white text-xl">
                            No Journals Created
                        </h3>
                        <p className="mb-8 text-white/60">
                            Create your first trading journal to start tracking
                            your performance.
                        </p>

                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Button
                                className="bg-white text-black hover:bg-gray-200"
                                onClick={() => setIsCreateModalOpen(true)}
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
            ) : (
                <div className="space-y-8">
                    {/* All Journals Section */}
                    <Card className="border border-white/10 bg-black/20">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-white">
                                        All Journals
                                    </CardTitle>
                                    <CardDescription className="text-white/60">
                                        {journals.length} journal
                                        {journals.length > 1 ? "s" : ""}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <BookOpen className="h-4 w-4 text-white/60" />
                                    <span className="text-sm text-white/60">
                                        {journals.length} TOTAL
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DraggableJournalList
                                journals={journals}
                                onDelete={(journal) =>
                                    handleDeleteJournal(journal.id)
                                }
                                onEdit={(journal) => setEditingJournal(journal)}
                                onReorder={handleReorderJournals}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modals */}
            <CreateJournalModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    refetchJournals();
                }}
            />

            {editingJournal && (
                <EditJournalModal
                    isOpen={!!editingJournal}
                    journal={editingJournal}
                    onClose={() => setEditingJournal(null)}
                    onSuccess={() => {
                        setEditingJournal(null);
                        refetchJournals();
                    }}
                />
            )}
        </div>
    );
}
