"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { api } from "@/trpc/client";

const createTradeSchema = z.object({
    tradeDate: z.string().min(1, "Date is required"),
    symbol: z.string().min(1, "Asset is required"),
    sessionId: z.string().optional(),
    setupId: z.string().optional(),
    riskInput: z.string().optional(),
    profitLossAmount: z.string().optional(),
    profitLossPercentage: z.string().optional(),
    exitReason: z.enum(["TP", "BE", "SL", "Manual"]).optional(),
    tradingviewLink: z.string().optional(),
    notes: z.string().optional(),
    journalId: z.string().min(1, "Journal is required"),
});

type CreateTradeForm = z.infer<typeof createTradeSchema>;

interface CreateTradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    journalId?: string;
}

export function CreateTradeModal({
    isOpen,
    onClose,
    journalId,
}: CreateTradeModalProps) {
    const utils = api.useUtils();
    const [showQuickCreate, setShowQuickCreate] = useState<{
        asset: boolean;
        session: boolean;
        setup: boolean;
    }>({ asset: false, session: false, setup: false });

    const form = useForm<CreateTradeForm>({
        resolver: zodResolver(createTradeSchema),
        defaultValues: {
            tradeDate: new Date().toISOString().split("T")[0],
            symbol: "",
            riskInput: "",
            profitLossAmount: "",
            profitLossPercentage: "",
            tradingviewLink: "",
            notes: "",
            journalId: journalId || "",
        },
        mode: "onChange",
    });

    React.useEffect(() => {
        if (journalId) {
            form.setValue("journalId", journalId);
        }
    }, [journalId, form]);

    const { data: assets } = api.trading.getAssets.useQuery({
        journalId: journalId || "",
    });
    const { data: sessions } = api.trading.getSessions.useQuery({
        journalId: journalId || "",
    });
    const { data: setups } = api.trading.getSetups.useQuery({
        journalId: journalId || "",
    });

    const { data: journal } = api.trading.getJournalById.useQuery(
        { id: journalId || "" },
        { enabled: !!journalId }
    );

    const { data: capitalData } = api.trading.getCurrentCapital.useQuery(
        { journalId: journalId || "" },
        { enabled: !!journalId && !!journal?.usePercentageCalculation }
    ) as {
        data:
            | { currentCapital: string | null; startingCapital: string | null }
            | undefined;
    };

    const profitLossAmount = form.watch("profitLossAmount");
    const profitLossPercentage = form.watch("profitLossPercentage");

    const calculations = useMemo(() => {
        if (
            !(journal?.usePercentageCalculation && capitalData?.currentCapital)
        ) {
            return { calculatedAmount: null, calculatedPercentage: null };
        }

        const currentCapital = Number.parseFloat(capitalData.currentCapital);

        if (profitLossPercentage && !profitLossAmount) {
            const percentage = Number.parseFloat(profitLossPercentage);
            const amount = (percentage / 100) * currentCapital;
            return {
                calculatedAmount: amount.toFixed(2),
                calculatedPercentage: null,
            };
        }

        if (profitLossAmount && !profitLossPercentage) {
            const amount = Number.parseFloat(profitLossAmount);
            const percentage = (amount / currentCapital) * 100;
            return {
                calculatedAmount: null,
                calculatedPercentage: percentage.toFixed(2),
            };
        }

        return { calculatedAmount: null, calculatedPercentage: null };
    }, [
        profitLossAmount,
        profitLossPercentage,
        journal?.usePercentageCalculation,
        capitalData?.currentCapital,
    ]);

    const createTradeMutation = api.trading.createTrade.useMutation({
        onSuccess: () => {
            utils.trading.getTrades.invalidate();
            utils.trading.getStats.invalidate();
            form.reset({
                tradeDate: new Date().toISOString().split("T")[0],
                symbol: "",
                riskInput: "",
                profitLossAmount: "",
                profitLossPercentage: "",
                tradingviewLink: "",
                notes: "",
                journalId: journalId || "",
            });
            onClose();
        },
    });

    const createAssetMutation = api.trading.createAsset.useMutation({
        onSuccess: () => {
            utils.trading.getAssets.invalidate();
            setShowQuickCreate((prev) => ({ ...prev, asset: false }));
        },
    });

    const createSessionMutation = api.trading.createSession.useMutation({
        onSuccess: () => {
            utils.trading.getSessions.invalidate();
            setShowQuickCreate((prev) => ({ ...prev, session: false }));
        },
    });

    const createSetupMutation = api.trading.createSetup.useMutation({
        onSuccess: () => {
            utils.trading.getSetups.invalidate();
            setShowQuickCreate((prev) => ({ ...prev, setup: false }));
        },
    });

    const handleQuickCreateAsset = async (name: string, symbol: string) => {
        if (!(journalId && name.trim() && symbol.trim())) return;

        try {
            const newAsset = await createAssetMutation.mutateAsync({
                journalId,
                name: name.trim(),
                symbol: symbol.trim().toUpperCase(),
            });

            form.setValue("symbol", newAsset.symbol);
        } catch (error) {
            console.error("Error creating asset:", error);
        }
    };

    const handleQuickCreateSession = async (name: string) => {
        if (!(journalId && name.trim())) return;

        try {
            const newSession = await createSessionMutation.mutateAsync({
                journalId,
                name: name.trim(),
                timezone: "UTC",
            });

            form.setValue("sessionId", newSession.id);
        } catch (error) {
            console.error("Error creating session:", error);
        }
    };

    const handleQuickCreateSetup = async (name: string) => {
        if (!(journalId && name.trim())) return;

        try {
            const newSetup = await createSetupMutation.mutateAsync({
                journalId,
                name: name.trim(),
            });

            form.setValue("setupId", newSetup.id);
        } catch (error) {
            console.error("Error creating setup:", error);
        }
    };

    const handleSubmit = async (data: CreateTradeForm) => {
        try {
            if (!(data.profitLossAmount || data.profitLossPercentage)) {
                alert("Please provide either amount or percentage");
                return;
            }

            const tradeData = {
                ...data,
                tradeDate: data.tradeDate,
                journalId: journalId!,
                isClosed: true,
            };

            await createTradeMutation.mutateAsync(tradeData);
        } catch (error) {
            console.error("Error creating trade:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-white/20 bg-black">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white">
                                New Trade
                            </CardTitle>
                            <CardDescription className="text-white/70">
                                Add a new trade to your journal
                            </CardDescription>
                        </div>
                        <Button
                            className="text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={onClose}
                            size="sm"
                            variant="ghost"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="text-white">
                    <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit(handleSubmit)}
                    >
                        <div>
                            <Label
                                className="text-white/80"
                                htmlFor="tradeDate"
                            >
                                Date
                            </Label>
                            <Input
                                id="tradeDate"
                                type="date"
                                {...form.register("tradeDate")}
                                className="border-white/30 bg-black text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                            />
                            {form.formState.errors.tradeDate && (
                                <p className="mt-1 text-red-500 text-sm">
                                    {form.formState.errors.tradeDate.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <Label
                                    className="text-white/80"
                                    htmlFor="symbol"
                                >
                                    Asset
                                </Label>
                                <Button
                                    className="h-6 px-2 text-white/60 text-xs hover:bg-white/10 hover:text-white"
                                    onClick={() =>
                                        setShowQuickCreate((prev) => ({
                                            ...prev,
                                            asset: !prev.asset,
                                        }))
                                    }
                                    size="sm"
                                    type="button"
                                    variant="ghost"
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Quick create
                                </Button>
                            </div>

                            {showQuickCreate.asset ? (
                                <QuickCreateAsset
                                    isLoading={createAssetMutation.isPending}
                                    onCancel={() =>
                                        setShowQuickCreate((prev) => ({
                                            ...prev,
                                            asset: false,
                                        }))
                                    }
                                    onCreate={handleQuickCreateAsset}
                                />
                            ) : (
                                <Select
                                    onValueChange={(value) =>
                                        form.setValue("symbol", value)
                                    }
                                    value={form.watch("symbol")}
                                >
                                    <SelectTrigger className="border-white/30 bg-black text-white focus:border-white focus:ring-1 focus:ring-white">
                                        <SelectValue placeholder="Select an asset" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assets?.map((asset) => (
                                            <SelectItem
                                                key={asset.id}
                                                value={asset.symbol}
                                            >
                                                {asset.name} ({asset.symbol})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {form.formState.errors.symbol && (
                                <p className="mt-1 text-red-500 text-sm">
                                    {form.formState.errors.symbol.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <Label
                                    className="text-white/80"
                                    htmlFor="sessionId"
                                >
                                    Session
                                </Label>
                                <Button
                                    className="h-6 px-2 text-white/60 text-xs hover:bg-white/10 hover:text-white"
                                    onClick={() =>
                                        setShowQuickCreate((prev) => ({
                                            ...prev,
                                            session: !prev.session,
                                        }))
                                    }
                                    size="sm"
                                    type="button"
                                    variant="ghost"
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Quick create
                                </Button>
                            </div>

                            {showQuickCreate.session ? (
                                <QuickCreateSession
                                    isLoading={createSessionMutation.isPending}
                                    onCancel={() =>
                                        setShowQuickCreate((prev) => ({
                                            ...prev,
                                            session: false,
                                        }))
                                    }
                                    onCreate={handleQuickCreateSession}
                                />
                            ) : (
                                <Select
                                    onValueChange={(value) =>
                                        form.setValue("sessionId", value)
                                    }
                                    value={form.watch("sessionId") || ""}
                                >
                                    <SelectTrigger className="border-white/20 bg-black/30 text-white">
                                        <SelectValue placeholder="Select a session" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sessions?.map((session) => (
                                            <SelectItem
                                                key={session.id}
                                                value={session.id}
                                            >
                                                {session.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <Label
                                    className="text-white/80"
                                    htmlFor="setupId"
                                >
                                    Setup
                                </Label>
                                <Button
                                    className="h-6 px-2 text-white/60 text-xs hover:bg-white/10 hover:text-white"
                                    onClick={() =>
                                        setShowQuickCreate((prev) => ({
                                            ...prev,
                                            setup: !prev.setup,
                                        }))
                                    }
                                    size="sm"
                                    type="button"
                                    variant="ghost"
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Quick create
                                </Button>
                            </div>

                            {showQuickCreate.setup ? (
                                <QuickCreateSetup
                                    isLoading={createSetupMutation.isPending}
                                    onCancel={() =>
                                        setShowQuickCreate((prev) => ({
                                            ...prev,
                                            setup: false,
                                        }))
                                    }
                                    onCreate={handleQuickCreateSetup}
                                />
                            ) : (
                                <Select
                                    onValueChange={(value) =>
                                        form.setValue("setupId", value)
                                    }
                                    value={form.watch("setupId") || ""}
                                >
                                    <SelectTrigger className="border-white/20 bg-black/30 text-white">
                                        <SelectValue placeholder="Select a setup" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {setups?.map((setup) => (
                                            <SelectItem
                                                key={setup.id}
                                                value={setup.id}
                                            >
                                                {setup.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div>
                            <Label
                                className="text-white/80"
                                htmlFor="riskInput"
                            >
                                Risk (%)
                            </Label>
                            <Input
                                id="riskInput"
                                {...form.register("riskInput")}
                                className="border-white/30 bg-black text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                                placeholder="2.0"
                            />
                            {form.formState.errors.riskInput && (
                                <p className="mt-1 text-red-500 text-sm">
                                    {form.formState.errors.riskInput.message}
                                </p>
                            )}
                        </div>

                        {journal?.usePercentageCalculation &&
                        journal?.startingCapital ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label
                                        className="text-white/80"
                                        htmlFor="profitLossAmount"
                                    >
                                        Result (€)
                                        {calculations.calculatedAmount && (
                                            <span className="ml-2 font-normal text-white/60">
                                                ={" "}
                                                {calculations.calculatedAmount}€
                                            </span>
                                        )}
                                    </Label>
                                    <Input
                                        id="profitLossAmount"
                                        {...form.register("profitLossAmount")}
                                        className="border-white/30 bg-black text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                                        placeholder="250.00"
                                        step="0.01"
                                        type="number"
                                    />
                                    {form.formState.errors.profitLossAmount && (
                                        <p className="mt-1 text-red-500 text-sm">
                                            {
                                                form.formState.errors
                                                    .profitLossAmount.message
                                            }
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label
                                        className="text-white/80"
                                        htmlFor="profitLossPercentage"
                                    >
                                        Result (%)
                                        {calculations.calculatedPercentage && (
                                            <span className="ml-2 font-normal text-white/60">
                                                ={" "}
                                                {
                                                    calculations.calculatedPercentage
                                                }
                                                %
                                            </span>
                                        )}
                                    </Label>
                                    <Input
                                        id="profitLossPercentage"
                                        {...form.register(
                                            "profitLossPercentage"
                                        )}
                                        className="border-white/30 bg-black text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                                        placeholder="2.5"
                                        step="0.01"
                                        type="number"
                                    />
                                    {form.formState.errors
                                        .profitLossPercentage && (
                                        <p className="mt-1 text-red-500 text-sm">
                                            {
                                                form.formState.errors
                                                    .profitLossPercentage
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Label
                                    className="text-white/80"
                                    htmlFor="profitLossPercentage"
                                >
                                    Result (%)
                                    <span className="ml-2 text-sm text-white/40">
                                        • Backtest mode
                                    </span>
                                </Label>
                                <Input
                                    id="profitLossPercentage"
                                    {...form.register("profitLossPercentage")}
                                    className="border-white/30 bg-black text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                                    placeholder="2.5"
                                    step="0.01"
                                    type="number"
                                />
                                {form.formState.errors.profitLossPercentage && (
                                    <p className="mt-1 text-red-500 text-sm">
                                        {
                                            form.formState.errors
                                                .profitLossPercentage.message
                                        }
                                    </p>
                                )}
                                <p className="mt-1 text-white/50 text-xs">
                                    No need for euro amounts in this journal
                                </p>
                            </div>
                        )}

                        {journal?.usePercentageCalculation && capitalData && (
                            <div className="rounded border border-white/10 bg-black/20 p-2 text-white/50 text-xs">
                                Current capital: {capitalData.currentCapital}€
                                {capitalData.startingCapital && (
                                    <span className="ml-2 text-white/40">
                                        (Started with:{" "}
                                        {capitalData.startingCapital}€)
                                    </span>
                                )}
                            </div>
                        )}

                        <div>
                            <Label
                                className="text-white/80"
                                htmlFor="exitReason"
                            >
                                Exit reason
                            </Label>
                            <Select
                                onValueChange={(value) =>
                                    form.setValue(
                                        "exitReason",
                                        value as "TP" | "BE" | "SL" | "Manual"
                                    )
                                }
                                value={form.watch("exitReason") || ""}
                            >
                                <SelectTrigger className="border-white/30 bg-black text-white focus:border-white focus:ring-1 focus:ring-white">
                                    <SelectValue placeholder="Select exit reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TP">
                                        TP (Take Profit)
                                    </SelectItem>
                                    <SelectItem value="BE">
                                        BE (Break Even)
                                    </SelectItem>
                                    <SelectItem value="SL">
                                        SL (Stop Loss)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.exitReason && (
                                <p className="mt-1 text-red-500 text-sm">
                                    {form.formState.errors.exitReason.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label
                                className="text-white/80"
                                htmlFor="tradingviewLink"
                            >
                                TradingView link (optional)
                            </Label>
                            <Input
                                id="tradingviewLink"
                                {...form.register("tradingviewLink")}
                                className="border-white/20 bg-black/30 text-white placeholder:text-white/40"
                                placeholder="https://www.tradingview.com/..."
                            />
                        </div>

                        <div>
                            <Label className="text-white/80" htmlFor="notes">
                                Notes (optional)
                            </Label>
                            <Textarea
                                id="notes"
                                {...form.register("notes")}
                                className="border-white/20 bg-black/30 text-white placeholder:text-white/40"
                                placeholder="Trade notes..."
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                onClick={onClose}
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-white text-black hover:bg-gray-200"
                                disabled={createTradeMutation.isPending}
                                type="submit"
                            >
                                {createTradeMutation.isPending
                                    ? "Creating..."
                                    : "Create trade"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

interface QuickCreateAssetProps {
    onCreate: (name: string, symbol: string) => void;
    onCancel: () => void;
    isLoading: boolean;
}

function QuickCreateAsset({
    onCreate,
    onCancel,
    isLoading,
}: QuickCreateAssetProps) {
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");

    const handleSubmit = () => {
        if (name.trim() && symbol.trim()) {
            onCreate(name, symbol);
            setName("");
            setSymbol("");
        }
    };

    return (
        <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Create new asset</span>
                <Button
                    className="h-6 w-6 p-0 text-white/60"
                    onClick={onCancel}
                    size="sm"
                    type="button"
                    variant="ghost"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Input
                    className="h-8 border-white/15 bg-black/40 text-white text-xs placeholder:text-white/50"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Asset name"
                    value={name}
                />
                <Input
                    className="h-8 border-white/15 bg-black/40 text-white text-xs placeholder:text-white/50"
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Symbol"
                    value={symbol}
                />
            </div>
            <Button
                className="h-7 w-full bg-white/20 text-white text-xs hover:bg-white/30"
                disabled={isLoading || !name.trim() || !symbol.trim()}
                onClick={handleSubmit}
                size="sm"
                type="button"
            >
                {isLoading ? "Creating..." : "Create"}
            </Button>
        </div>
    );
}

interface QuickCreateSessionProps {
    onCreate: (name: string) => void;
    onCancel: () => void;
    isLoading: boolean;
}

function QuickCreateSession({
    onCreate,
    onCancel,
    isLoading,
}: QuickCreateSessionProps) {
    const [name, setName] = useState("");

    const handleSubmit = () => {
        if (name.trim()) {
            onCreate(name);
            setName("");
        }
    };

    return (
        <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">
                    Create new session
                </span>
                <Button
                    className="h-6 w-6 p-0 text-white/60"
                    onClick={onCancel}
                    size="sm"
                    type="button"
                    variant="ghost"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
            <Input
                className="h-8 border-white/15 bg-black/40 text-white text-xs placeholder:text-white/50"
                onChange={(e) => setName(e.target.value)}
                placeholder="Session name"
                value={name}
            />
            <Button
                className="h-7 w-full bg-white/20 text-white text-xs hover:bg-white/30"
                disabled={isLoading || !name.trim()}
                onClick={handleSubmit}
                size="sm"
                type="button"
            >
                {isLoading ? "Creating..." : "Create"}
            </Button>
        </div>
    );
}

interface QuickCreateSetupProps {
    onCreate: (name: string) => void;
    onCancel: () => void;
    isLoading: boolean;
}

function QuickCreateSetup({
    onCreate,
    onCancel,
    isLoading,
}: QuickCreateSetupProps) {
    const [name, setName] = useState("");

    const handleSubmit = () => {
        if (name.trim()) {
            onCreate(name);
            setName("");
        }
    };

    return (
        <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Create new setup</span>
                <Button
                    className="h-6 w-6 p-0 text-white/60"
                    onClick={onCancel}
                    size="sm"
                    type="button"
                    variant="ghost"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
            <Input
                className="h-8 border-white/15 bg-black/40 text-white text-xs placeholder:text-white/50"
                onChange={(e) => setName(e.target.value)}
                placeholder="Setup name"
                value={name}
            />
            <Button
                className="h-7 w-full bg-white/20 text-white text-xs hover:bg-white/30"
                disabled={isLoading || !name.trim()}
                onClick={handleSubmit}
                size="sm"
                type="button"
            >
                {isLoading ? "Creating..." : "Create"}
            </Button>
        </div>
    );
}
