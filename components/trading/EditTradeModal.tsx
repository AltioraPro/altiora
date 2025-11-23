"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import type { TradeItem } from "@/app/(app)/trading/_components/trades-table/columns";
import {
    FormCombobox,
    FormInput,
    FormMultiSelect,
    FormSelect,
    FormTextarea,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { orpc } from "@/orpc/client";
import { updateAdvancedTradeSchema } from "@/server/routers/trading/validators";
import { FormDateInput } from "../form/form-date-input";
import { useToast } from "../ui/toast";

type UpdateTradeForm = z.infer<typeof updateAdvancedTradeSchema>;

interface EditTradeModalProps {
    onClose: () => void;
    trade: TradeItem | null;
}

function useTradeFormData(journalId: string | undefined) {
    const { data: assets } = useQuery(
        orpc.trading.getAssets.queryOptions({
            input: { journalId: journalId ?? undefined },
            enabled: !!journalId,
        })
    );

    const { data: sessions } = useQuery(
        orpc.trading.getSessions.queryOptions({
            input: { journalId: journalId ?? undefined },
            enabled: !!journalId,
        })
    );

    const { data: journal } = useQuery(
        orpc.trading.getJournalById.queryOptions({
            input: { id: journalId ?? "" },
            enabled: !!journalId,
        })
    );

    const { data: capitalData } = useQuery(
        orpc.trading.getCurrentCapital.queryOptions({
            input: { journalId: journalId ?? "" },
            enabled: !!journalId && !!journal?.usePercentageCalculation,
        })
    );

    const { data: confirmations } = useQuery(
        orpc.trading.getConfirmations.queryOptions({
            input: { journalId: journalId ?? "" },
            enabled: !!journalId,
        })
    );

    return { assets, sessions, journal, capitalData, confirmations };
}

export function EditTradeModal({ onClose, trade }: EditTradeModalProps) {
    const { addToast } = useToast();

    const form = useForm<UpdateTradeForm>({
        resolver: zodResolver(updateAdvancedTradeSchema),
    });

    useEffect(() => {
        if (trade) {
            form.reset({
                confirmationIds:
                    trade.tradesConfirmations?.map(
                        (confirmation) => confirmation.confirmationId
                    ) || [],
                assetId: trade.assetId || "",
                sessionId: trade.sessionId || "",
                tradeDate: trade.tradeDate
                    ? new Date(trade.tradeDate).toISOString().split("T")[0]
                    : "",
                riskInput: trade.riskInput || "",
                profitLossAmount: trade.profitLossAmount || "",
                profitLossPercentage: trade.profitLossPercentage || "",
                exitReason: trade.exitReason as
                    | "TP"
                    | "BE"
                    | "SL"
                    | "Manual"
                    | undefined,
                tradingviewLink: trade.tradingviewLink || "",
                notes: trade.notes || "",
                isClosed: trade.isClosed || undefined,
                id: trade.id || "",
            });
        }
    }, [trade, form]);

    const journalId = trade?.journalId;
    const { assets, sessions, journal, capitalData, confirmations } =
        useTradeFormData(journalId);

    const { mutateAsync: updateTrade, isPending: isUpdatingTrade } =
        useMutation(
            orpc.trading.updateTrade.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.trading.getTrades.queryKey({
                            input: { journalId: journalId ?? "" },
                        }),
                        orpc.trading.getStats.queryKey({
                            input: { journalId: journalId ?? "" },
                        }),
                    ],
                },
                onSuccess: () => {
                    addToast({
                        type: "success",
                        title: "Success",
                        message: "Trade updated successfully",
                    });
                    form.reset();
                    onClose();
                },
                onError: (error) => {
                    console.error(error);
                    addToast({
                        type: "error",
                        title: "Error",
                        message: error.message || "Failed to update trade",
                    });
                },
            })
        );

    const { mutateAsync: createAsset, isPending: isCreatingAsset } =
        useMutation(
            orpc.trading.createAsset.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.trading.getAssets.queryKey({
                            input: { journalId: journalId ?? "" },
                        }),
                    ],
                },
            })
        );

    const { mutateAsync: createSession, isPending: isCreatingSession } =
        useMutation(
            orpc.trading.createSession.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.trading.getSessions.queryKey({
                            input: { journalId: journalId ?? "" },
                        }),
                    ],
                },
            })
        );

    const handleSubmit = async (data: UpdateTradeForm) => {
        await updateTrade(data);
    };

    const handleClose = () => {
        if (isUpdatingTrade) {
            return;
        }
        form.reset();
        onClose();
    };

    const handleCreateAsset = async (name: string) => {
        if (!journalId) {
            return "";
        }
        const newAsset = await createAsset({
            journalId,
            name: name.trim(),
            type: "forex",
        });
        return newAsset.id;
    };

    const handleCreateSession = async (name: string) => {
        if (!journalId) {
            return "";
        }
        const newSession = await createSession({
            journalId,
            name: name.trim(),
            timezone: "UTC",
        });
        return newSession.id;
    };

    const assetOptions =
        assets?.map((asset) => ({
            value: asset.id,
            label: asset.name,
        })) || [];

    const sessionOptions =
        sessions?.map((session) => ({
            value: session.id,
            label: session.name,
        })) || [];

    const confirmationOptions =
        confirmations?.map((confirmation) => ({
            value: confirmation.id,
            label: confirmation.name,
        })) || [];

    return (
        <Dialog onOpenChange={handleClose} open={!!trade}>
            <form
                id="edit-trade-form"
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Trade</DialogTitle>
                        <DialogDescription>
                            Update trade details and performance
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <FormCombobox
                                control={form.control}
                                disabled={isUpdatingTrade}
                                emptyText="No asset found. Type to create a new one."
                                isCreating={isCreatingAsset}
                                label="Asset"
                                name="assetId"
                                onCreate={(name) => handleCreateAsset(name)}
                                options={assetOptions}
                                placeholder="Select an asset"
                                searchPlaceholder="Search asset..."
                            />

                            <FormCombobox
                                control={form.control}
                                disabled={isUpdatingTrade}
                                emptyText="No session found. Type to create a new one."
                                isCreating={isCreatingSession}
                                label="Session"
                                name="sessionId"
                                onCreate={(name) => handleCreateSession(name)}
                                options={sessionOptions}
                                placeholder="Select a session"
                                searchPlaceholder="Search session..."
                            />
                        </div>

                        <FormMultiSelect
                            control={form.control}
                            label="Confirmations"
                            name="confirmationIds"
                            options={confirmationOptions}
                            placeholder="Select confirmations"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                control={form.control}
                                label="Risk (%)"
                                name="riskInput"
                                placeholder="2.0"
                                step="0.1"
                                type="number"
                            />

                            {journal?.usePercentageCalculation &&
                            journal?.startingCapital ? (
                                <FormInput
                                    control={form.control}
                                    label="Result (€)"
                                    name="profitLossAmount"
                                    placeholder="250.00"
                                    step="0.01"
                                    type="number"
                                />
                            ) : (
                                <FormInput
                                    control={form.control}
                                    label="Result (%)"
                                    name="profitLossPercentage"
                                    placeholder="2.5"
                                    step="0.01"
                                    type="number"
                                />
                            )}
                        </div>

                        {journal?.usePercentageCalculation && capitalData && (
                            <div className="rounded border bg-muted p-2 text-muted-foreground text-xs">
                                Current capital: {capitalData.currentCapital}€
                                {capitalData.startingCapital && (
                                    <span className="ml-2">
                                        (Started with:{" "}
                                        {capitalData.startingCapital}€)
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormDateInput
                                control={form.control}
                                label="Date"
                                name="tradeDate"
                                placeholder="Select a date"
                            />

                            <FormSelect
                                control={form.control}
                                label="Exit reason"
                                name="exitReason"
                                options={[
                                    { value: "TP", label: "TP (Take Profit)" },
                                    { value: "BE", label: "BE (Break Even)" },
                                    { value: "SL", label: "SL (Stop Loss)" },
                                    {
                                        value: "Manual",
                                        label: "Manual",
                                    },
                                ]}
                                placeholder="Select exit reason"
                            />
                        </div>

                        <FormInput
                            control={form.control}
                            label="TradingView link"
                            name="tradingviewLink"
                            placeholder="https://www.tradingview.com/..."
                            type="url"
                        />

                        <FormTextarea
                            control={form.control}
                            label="Notes"
                            name="notes"
                            placeholder="Trade notes..."
                            rows={3}
                        />
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                disabled={isUpdatingTrade}
                                onClick={handleClose}
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            disabled={
                                isUpdatingTrade ||
                                !form.formState.isValid ||
                                !form.formState.isDirty
                            }
                            form="edit-trade-form"
                            type="submit"
                        >
                            {isUpdatingTrade ? "Updating..." : "Update trade"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
