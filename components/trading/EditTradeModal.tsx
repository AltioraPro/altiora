"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { RiCloseLine } from "@remixicon/react";
import { useEffect, useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { orpc } from "@/orpc/client";

interface EditTradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    tradeId: string;
    onSuccess?: () => void;
}

export function EditTradeModal({
    isOpen,
    onClose,
    tradeId,
    onSuccess,
}: EditTradeModalProps) {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        tradeDate: "",
        assetId: "",
        sessionId: "",
        setupId: "",
        riskPercentage: "",
        resultPercentage: "",
        exitReason: "",
        tradingViewLink: "",
        notes: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const { data: trade, isLoading: tradeLoading } = useQuery(
        orpc.trading.getTradeById.queryOptions({
            input: { id: tradeId },
            enabled: isOpen && !!tradeId,
        })
    );

    const { data: sessions } = useQuery(
        orpc.trading.getSessions.queryOptions({
            input: { journalId: trade?.journalId },
        })
    );

    const { data: setups } = useQuery(
        orpc.trading.getSetups.queryOptions({
            input: { journalId: trade?.journalId },
        })
    );

    const { data: assets } = useQuery(
        orpc.trading.getAssets.queryOptions({
            input: { journalId: trade?.journalId },
        })
    );

    useEffect(() => {
        if (trade) {
            setFormData({
                tradeDate: trade.tradeDate
                    ? new Date(trade.tradeDate).toISOString().split("T")[0]
                    : "",
                assetId: trade.assetId || "",
                sessionId: trade.sessionId || "",
                setupId: trade.setupId || "",
                riskPercentage: trade.riskInput?.toString() || "",
                resultPercentage: trade.profitLossPercentage?.toString() || "",
                exitReason: trade.exitReason || "",
                tradingViewLink:
                    (trade as { tradingviewLink?: string }).tradingviewLink ||
                    "",
                notes: trade.notes || "",
            });
        }
    }, [trade]);

    const { mutateAsync: updateTrade } = useMutation(
        orpc.trading.updateTrade.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getTradeById.queryKey({
                        input: { id: tradeId },
                    }),
                    orpc.trading.getTrades.queryKey({
                        input: { journalId: trade?.journalId },
                    }),
                    orpc.trading.getStats.queryKey({
                        input: { journalId: trade?.journalId },
                    }),
                ],
            },
            onSuccess: () => {
                addToast({
                    type: "success",
                    title: "Success",
                    message: "Trade updated successfully",
                });
                onSuccess?.();
                onClose();
            },
            onError: (error) => {
                addToast({
                    type: "error",
                    title: "Error",
                    message: error.message || "Failed to update trade",
                });
            },
        })
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updateData: {
                id: string;
                tradeDate: string;
                assetId?: string;
                sessionId?: string;
                setupId?: string;
                riskInput: string;
                profitLossPercentage: string;
                exitReason?: "TP" | "BE" | "SL" | "Manual";
                tradingviewLink?: string;
                notes?: string;
            } = {
                id: tradeId,
                tradeDate: formData.tradeDate,
                riskInput: String(formData.riskPercentage),
                profitLossPercentage: String(formData.resultPercentage),
            };

            if (formData.assetId) {
                updateData.assetId = formData.assetId;
            }
            if (formData.sessionId) {
                updateData.sessionId = formData.sessionId;
            }
            if (formData.setupId) {
                updateData.setupId = formData.setupId;
            }
            if (formData.exitReason) {
                updateData.exitReason = formData.exitReason as
                    | "TP"
                    | "BE"
                    | "SL"
                    | "Manual";
            }
            if (formData.tradingViewLink) {
                updateData.tradingviewLink = formData.tradingViewLink;
            }
            if (formData.notes) {
                updateData.notes = formData.notes;
            }

            await updateTrade(updateData);
        } catch (error) {
            console.error("Error updating trade:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-white/10 bg-black/90">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-white">Edit Trade</CardTitle>
                        <CardDescription className="text-white/60">
                            Update trade details and performance
                        </CardDescription>
                    </div>
                    <Button
                        className="text-white/60 hover:text-white"
                        onClick={onClose}
                        size="sm"
                        variant="ghost"
                    >
                        <RiCloseLine className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent>
                    {tradeLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-white border-b-2" />
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <Label
                                    className="text-white"
                                    htmlFor="tradeDate"
                                >
                                    Date *
                                </Label>
                                <Input
                                    className="border-white/20 bg-black/50 text-white"
                                    id="tradeDate"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tradeDate: e.target.value,
                                        })
                                    }
                                    required
                                    type="date"
                                    value={formData.tradeDate}
                                />
                            </div>

                            <div>
                                <Label className="text-white" htmlFor="assetId">
                                    Asset
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            assetId: value,
                                        })
                                    }
                                    value={formData.assetId}
                                >
                                    <SelectTrigger className="border-white/20 bg-black/50 text-white">
                                        <SelectValue placeholder="Select an asset" />
                                    </SelectTrigger>
                                    <SelectContent className="border-white/20 bg-black/90">
                                        {assets?.map((asset) => (
                                            <SelectItem
                                                className="text-white hover:bg-white/10"
                                                key={asset.id}
                                                value={asset.id}
                                            >
                                                {asset.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label
                                    className="text-white"
                                    htmlFor="sessionId"
                                >
                                    Session
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            sessionId: value,
                                        })
                                    }
                                    value={formData.sessionId}
                                >
                                    <SelectTrigger className="border-white/20 bg-black/50 text-white">
                                        <SelectValue placeholder="Select a session" />
                                    </SelectTrigger>
                                    <SelectContent className="border-white/20 bg-black/90">
                                        {sessions?.map((session) => (
                                            <SelectItem
                                                className="text-white hover:bg-white/10"
                                                key={session.id}
                                                value={session.id}
                                            >
                                                {session.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-white" htmlFor="setupId">
                                    Confirmation
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            setupId: value,
                                        })
                                    }
                                    value={formData.setupId}
                                >
                                    <SelectTrigger className="border-white/20 bg-black/50 text-white">
                                        <SelectValue placeholder="Select a confirmation" />
                                    </SelectTrigger>
                                    <SelectContent className="border-white/20 bg-black/90">
                                        {setups?.map((setup) => (
                                            <SelectItem
                                                className="text-white hover:bg-white/10"
                                                key={setup.id}
                                                value={setup.id}
                                            >
                                                {setup.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Risk and Result */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label
                                        className="text-white"
                                        htmlFor="riskPercentage"
                                    >
                                        Risk (%)
                                    </Label>
                                    <Input
                                        className="border-white/20 bg-black/50 text-white"
                                        id="riskPercentage"
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                riskPercentage: e.target.value,
                                            })
                                        }
                                        placeholder="2.0"
                                        step="0.1"
                                        type="number"
                                        value={formData.riskPercentage}
                                    />
                                </div>

                                <div>
                                    <Label
                                        className="text-white"
                                        htmlFor="resultPercentage"
                                    >
                                        Result (%) • Backtest mode
                                    </Label>
                                    <Input
                                        className="border-white/20 bg-black/50 text-white"
                                        id="resultPercentage"
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                resultPercentage:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="2.5"
                                        step="0.1"
                                        type="number"
                                        value={formData.resultPercentage}
                                    />
                                </div>
                            </div>

                            {/* Exit Reason */}
                            <div>
                                <Label
                                    className="text-white"
                                    htmlFor="exitReason"
                                >
                                    Exit reason
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            exitReason: value,
                                        })
                                    }
                                    value={formData.exitReason}
                                >
                                    <SelectTrigger className="border-white/20 bg-black/50 text-white">
                                        <SelectValue placeholder="Select exit reason" />
                                    </SelectTrigger>
                                    <SelectContent className="border-white/20 bg-black/90">
                                        <SelectItem
                                            className="text-white hover:bg-white/10"
                                            value="TP"
                                        >
                                            TP
                                        </SelectItem>
                                        <SelectItem
                                            className="text-white hover:bg-white/10"
                                            value="SL"
                                        >
                                            SL
                                        </SelectItem>
                                        <SelectItem
                                            className="text-white hover:bg-white/10"
                                            value="BE"
                                        >
                                            BE
                                        </SelectItem>
                                        <SelectItem
                                            className="text-white hover:bg-white/10"
                                            value="Manual"
                                        >
                                            Manual
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label
                                    className="text-white"
                                    htmlFor="tradingViewLink"
                                >
                                    TradingView link (optional)
                                </Label>
                                <Input
                                    className="border-white/20 bg-black/50 text-white"
                                    id="tradingViewLink"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tradingViewLink: e.target.value,
                                        })
                                    }
                                    placeholder="https://www.tradingview.com/..."
                                    type="url"
                                    value={formData.tradingViewLink}
                                />
                            </div>

                            <div>
                                <Label className="text-white" htmlFor="notes">
                                    Notes (optional)
                                </Label>
                                <Textarea
                                    className="border-white/20 bg-black/50 text-white"
                                    id="notes"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value,
                                        })
                                    }
                                    placeholder="Additional notes about this trade"
                                    rows={3}
                                    value={formData.notes}
                                />
                            </div>

                            <div className="flex justify-end space-x-3 border-white/10 border-t pt-4">
                                <Button
                                    className="border-white/20 text-white hover:bg-white/10"
                                    onClick={onClose}
                                    type="button"
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-white text-black hover:bg-gray-200"
                                    disabled={isLoading}
                                    type="submit"
                                >
                                    {isLoading ? "Updating..." : "Update Trade"}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
