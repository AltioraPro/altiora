"use client";

import {
    RiAddLine,
    RiAlertLine,
    RiBrush3Line,
    RiLoader2Line,
    RiSearchLine,
} from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/orpc/client";

interface ConfirmationsManagerProps {
    journalId: string;
}

export function ConfirmationsManager({ journalId }: ConfirmationsManagerProps) {
    const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [newConfirmation, setNewConfirmation] = useState({
        name: "",
        description: "",
        strategy: "",
        successRate: "",
    });

    const { data: confirmations, isLoading } = useQuery(
        orpc.trading.getConfirmations.queryOptions({
            input: { journalId },
        })
    );

    const {
        mutateAsync: createConfirmation,
        isPending: isCreatingConfirmation,
    } = useMutation(
        orpc.trading.createConfirmation.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getConfirmations.queryKey({
                        input: { journalId },
                    }),
                ],
            },
            onSuccess: () => {
                setNewConfirmation({
                    name: "",
                    description: "",
                    strategy: "",
                    successRate: "",
                });
            },
        })
    );

    const {
        mutateAsync: deleteConfirmation,
        isPending: isDeletingConfirmation,
    } = useMutation(
        orpc.trading.deleteConfirmation.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getConfirmations.queryKey({
                        input: { journalId },
                    }),
                ],
            },
        })
    );

    const handleCreateConfirmation = async () => {
        if (!newConfirmation.name.trim()) {
            return;
        }

        await createConfirmation({
            journalId,
            name: newConfirmation.name.trim(),
            description: newConfirmation.description.trim() || undefined,
            strategy: newConfirmation.strategy.trim() || undefined,
            successRate: newConfirmation.successRate
                ? Number.parseFloat(newConfirmation.successRate)
                : undefined,
        });
        setIsCreatingModalOpen(false);
    };

    const handleDeleteConfirmation = async (confirmationId: string) => {
        await deleteConfirmation({ id: confirmationId });
    };

    const filteredConfirmations =
        confirmations?.filter(
            (confirmation) =>
                confirmation.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                confirmation.description
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                confirmation.strategy
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
        ) || [];

    if (isLoading) {
        return (
            <Card className="border border-white/10 bg-black/20">
                <CardHeader>
                    <CardTitle className="text-white">Confirmations</CardTitle>
                    <CardDescription className="text-white/60">
                        Loading confirmations...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-white border-b-2" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-white/10 bg-black/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-white">
                            Confirmations
                        </CardTitle>
                        <CardDescription className="text-white/60">
                            {confirmations?.length || 0} confirmations • Manage
                            your trading strategies
                        </CardDescription>
                    </div>
                    <Button
                        className="bg-white text-black hover:bg-gray-200"
                        onClick={() =>
                            setIsCreatingModalOpen(!isCreatingModalOpen)
                        }
                    >
                        <RiAddLine className="mr-2 h-4 w-4" />
                        Add Confirmation
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <RiSearchLine className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-white/40" />
                    <Input
                        className="border-white/30 bg-black pl-10 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search confirmations..."
                        value={searchTerm}
                    />
                </div>

                {/* Create new setup form */}
                {isCreatingModalOpen && (
                    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                        <h3 className="mb-4 font-medium text-white">
                            Create New Confirmation
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-white/80">Name *</Label>
                                <Input
                                    className="border-white/30 bg-black text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                                    onChange={(e) =>
                                        setNewConfirmation((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Breakout Strategy"
                                    value={newConfirmation.name}
                                />
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                                <Button
                                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                                    onClick={() =>
                                        setIsCreatingModalOpen(false)
                                    }
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-white text-black hover:bg-gray-200"
                                    disabled={
                                        !newConfirmation.name.trim() ||
                                        isCreatingConfirmation
                                    }
                                    onClick={handleCreateConfirmation}
                                >
                                    {isCreatingConfirmation
                                        ? "Creating..."
                                        : "Create Confirmation"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Setups list */}
                {filteredConfirmations.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredConfirmations.map((confirmation) => (
                            <div
                                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3 transition-colors hover:border-white/20"
                                key={confirmation.id}
                            >
                                <span className="font-medium text-white">
                                    {confirmation.name}
                                </span>
                                <Button
                                    className="h-8 w-8 p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    disabled={isDeletingConfirmation}
                                    onClick={() =>
                                        handleDeleteConfirmation(
                                            confirmation.id
                                        )
                                    }
                                    size="sm"
                                    variant="ghost"
                                >
                                    {isDeletingConfirmation ? (
                                        <RiLoader2Line className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RiBrush3Line className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <RiAlertLine className="mx-auto mb-4 h-12 w-12 text-white/40" />
                        <p className="text-white/60">
                            {searchTerm
                                ? "No confirmations found matching your search"
                                : "No confirmations found"}
                        </p>
                        <p className="text-sm text-white/40">
                            {searchTerm
                                ? "Try a different search term"
                                : "Start by creating your first confirmations"}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
