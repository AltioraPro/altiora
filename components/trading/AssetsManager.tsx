"use client";

import {
    RiAddLine,
    RiDeleteBinLine,
    RiErrorWarningLine,
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

interface AssetsManagerProps {
    journalId: string;
}

export function AssetsManager({ journalId }: AssetsManagerProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newAsset, setNewAsset] = useState({
        name: "",
        symbol: "",
        type: "forex" as "forex" | "crypto" | "stocks" | "commodities",
    });

    const { data: assets, isLoading } = useQuery(
        orpc.trading.getAssets.queryOptions({
            input: { journalId },
        })
    );

    const createAssetMutation = useMutation(
        orpc.trading.createAsset.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getAssets.queryKey({ input: { journalId } }),
                ],
            },
            onSuccess: () => {
                setNewAsset({ name: "", symbol: "", type: "forex" });
                setIsCreating(false);
            },
        })
    );

    const deleteAssetMutation = useMutation(
        orpc.trading.deleteAsset.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getAssets.queryKey({ input: { journalId } }),
                ],
            },
        })
    );

    const handleCreateAsset = async () => {
        if (!newAsset.name.trim()) {
            return;
        }

        try {
            await createAssetMutation.mutateAsync({
                journalId,
                name: newAsset.name.trim(),
                type: newAsset.type,
            });
        } catch (error) {
            console.error("Error creating asset:", error);
        }
    };

    const handleDeleteAsset = async (assetId: string) => {
        await deleteAssetMutation.mutateAsync({ id: assetId });
    };

    if (isLoading) {
        return (
            <Card className="border border-white/10 bg-black/20">
                <CardHeader>
                    <CardTitle className="text-white">Assets</CardTitle>
                    <CardDescription className="text-white/60">
                        Loading assets...
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
                        <CardTitle className="text-white">Assets</CardTitle>
                        <CardDescription className="text-white/60">
                            {assets?.length || 0} assets • Manage your trading
                            instruments
                        </CardDescription>
                    </div>
                    <Button
                        className="bg-white text-black hover:bg-gray-200"
                        onClick={() => setIsCreating(!isCreating)}
                    >
                        <RiAddLine className="mr-2 h-4 w-4" />
                        Add Asset
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Create new asset form */}
                {isCreating && (
                    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                        <h3 className="mb-4 font-medium text-white">
                            Create New Asset
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-white/80">Name *</Label>
                                <Input
                                    className="border-white/30 bg-black text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                                    onChange={(e) =>
                                        setNewAsset((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="EUR/USD"
                                    value={newAsset.name}
                                />
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                                <Button
                                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                                    onClick={() => setIsCreating(false)}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-white text-black hover:bg-gray-200"
                                    disabled={
                                        !newAsset.name.trim() ||
                                        createAssetMutation.isPending
                                    }
                                    onClick={handleCreateAsset}
                                >
                                    {createAssetMutation.isPending
                                        ? "Creating..."
                                        : "Create Asset"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assets list */}
                {assets && assets?.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {assets.map((asset) => (
                            <div
                                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3 transition-colors hover:border-white/20"
                                key={asset.id}
                            >
                                <span className="font-medium text-white">
                                    {asset.name}
                                </span>
                                <Button
                                    className="h-8 w-8 p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    onClick={() => handleDeleteAsset(asset.id)}
                                    size="sm"
                                    variant="ghost"
                                >
                                    <RiDeleteBinLine className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                {assets && assets?.length === 0 && (
                    <div className="py-8 text-center">
                        <RiErrorWarningLine className="mx-auto mb-4 h-12 w-12 text-white/40" />
                        <p className="text-white/60">No assets found</p>
                        <p className="text-sm text-white/40">
                            Start by creating your first asset
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
