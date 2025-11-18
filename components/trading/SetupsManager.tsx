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

interface SetupsManagerProps {
    journalId: string;
}

export function SetupsManager({ journalId }: SetupsManagerProps) {
    const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [newSetup, setNewSetup] = useState({
        name: "",
        description: "",
        strategy: "",
        successRate: "",
    });

    const { data: setups, isLoading } = useQuery(
        orpc.trading.getSetups.queryOptions({
            input: { journalId },
        })
    );

    const { mutateAsync: createSetup, isPending: isCreatingSetup } =
        useMutation(
            orpc.trading.createSetup.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.trading.getSetups.queryKey({
                            input: { journalId },
                        }),
                    ],
                },
                onSuccess: () => {
                    setNewSetup({
                        name: "",
                        description: "",
                        strategy: "",
                        successRate: "",
                    });
                },
            })
        );

    const { mutateAsync: deleteSetup, isPending: isDeletingSetup } =
        useMutation(
            orpc.trading.deleteSetup.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.trading.getSetups.queryKey({
                            input: { journalId },
                        }),
                    ],
                },
            })
        );

    const handleCreateSetup = async () => {
        if (!newSetup.name.trim()) {
            return;
        }

        await createSetup({
            journalId,
            name: newSetup.name.trim(),
            description: newSetup.description.trim() || undefined,
            strategy: newSetup.strategy.trim() || undefined,
            successRate: newSetup.successRate
                ? Number.parseFloat(newSetup.successRate)
                : undefined,
        });
        setIsCreatingModalOpen(false);
    };

    const handleDeleteSetup = async (setupId: string) => {
        await deleteSetup({ id: setupId });
    };

    const filteredSetups =
        setups?.filter(
            (setup) =>
                setup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                setup.description
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                setup.strategy?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <CardTitle className="text-white">Confirmations</CardTitle>
                        <CardDescription className="text-white/60">
                            {setups?.length || 0} confirmations • Manage your trading
                            strategies
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
                                        setNewSetup((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Breakout Strategy"
                                    value={newSetup.name}
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
                                        !newSetup.name.trim() || isCreatingSetup
                                    }
                                    onClick={handleCreateSetup}
                                >
                                    {isCreatingSetup
                                        ? "Creating..."
                                        : "Create Confirmation"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Setups list */}
                {filteredSetups.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredSetups.map((setup) => (
                            <div
                                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3 transition-colors hover:border-white/20"
                                key={setup.id}
                            >
                                <span className="font-medium text-white">
                                    {setup.name}
                                </span>
                                <Button
                                    className="h-8 w-8 p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    disabled={isDeletingSetup}
                                    onClick={() => handleDeleteSetup(setup.id)}
                                    size="sm"
                                    variant="ghost"
                                >
                                    {isDeletingSetup ? (
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
                                : "Start by creating your first confirmation"}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
