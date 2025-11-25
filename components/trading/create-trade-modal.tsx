"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { z } from "zod";
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
import { createAdvancedTradeSchema } from "@/server/routers/trading/validators";
import { FormDateInput } from "../form/form-date-input";
import { useToast } from "../ui/toast";

type CreateTradeForm = z.infer<typeof createAdvancedTradeSchema>;

interface CreateTradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    journalId: string;
}

export function CreateTradeModal({
    isOpen,
    onClose,
    journalId,
}: CreateTradeModalProps) {
    const { addToast } = useToast();

    const form = useForm<CreateTradeForm>({
        resolver: zodResolver(createAdvancedTradeSchema),
        defaultValues: {
            tradeDate: new Date().toISOString().split("T")[0],
            riskInput: "",
            profitLossAmount: "",
            profitLossPercentage: "",
            tradingviewLink: "",
            notes: "",
            assetId: "",
            sessionId: null,
            confirmationIds: [],
            journalId,
            isClosed: true,
        },
    });

    const { data: assets } = useQuery(
        orpc.trading.getAssets.queryOptions({
            input: { journalId },
        })
    );

    const { data: sessions } = useQuery(
        orpc.trading.getSessions.queryOptions({
            input: { journalId },
        })
    );
    const { data: confirmations } = useQuery(
        orpc.trading.getConfirmations.queryOptions({
            input: { journalId },
        })
    );

    const { data: journal } = useQuery(
        orpc.trading.getJournalById.queryOptions({
            input: { id: journalId },
        })
    );

    const { data: capitalData } = useQuery(
        orpc.trading.getCurrentCapital.queryOptions({
            input: { journalId },
            enabled: !!journalId && !!journal?.usePercentageCalculation,
        })
    );

    const { mutateAsync: createTrade, isPending: isCreatingTrade } =
        useMutation(
            orpc.trading.createTrade.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.trading.getTrades.queryKey({
                            input: { journalId },
                        }),
                        orpc.trading.getStats.queryKey({
                            input: { journalId },
                        }),
                    ],
                },
                onSuccess: () => {
                    form.reset();
                    onClose();
                },
                onError: (error) => {
                    console.error(error);
                    addToast({
                        type: "error",
                        title: "Error",
                        message: error.message || "Failed to create trade",
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
                            input: { journalId },
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
                            input: { journalId },
                        }),
                    ],
                },
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
        })
    );

    const handleSubmit = async (data: CreateTradeForm) => {
        await createTrade(data);
    };

    const handleClose = () => {
        if (isCreatingTrade) {
            return;
        }
        form.reset();
        onClose();
    };

    const handleCreateAsset = async (name: string) => {
        const newAsset = await createAsset({
            journalId,
            name: name.trim(),
            type: "forex",
        });
        return newAsset.id;
    };

    const handleCreateSession = async (name: string) => {
        const newSession = await createSession({
            journalId,
            name: name.trim(),
            timezone: "UTC",
        });
        return newSession.id;
    };

    const handleCreateConfirmation = async (name: string) => {
        const newConfirmation = await createConfirmation({
            journalId,
            name: name.trim(),
        });
        return newConfirmation.id;
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
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <form
                id="create-trade-form"
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>New Trade</DialogTitle>
                        <DialogDescription>
                            Add a new trade to your journal
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <FormCombobox
                                control={form.control}
                                disabled={isCreatingTrade}
                                emptyText="No asset found. Type to create a new one."
                                isCreating={isCreatingAsset}
                                label="Asset"
                                name="assetId"
                                onCreate={(name) => handleCreateAsset(name)}
                                options={assetOptions}
                                placeholder="Select an asset"
                                required
                                searchPlaceholder="Search asset..."
                            />

                            <FormCombobox
                                control={form.control}
                                disabled={isCreatingTrade}
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
                            disabled={isCreatingTrade}
                            emptyText="No confirmations available. Type to create a new one."
                            isCreating={isCreatingConfirmation}
                            label="Confirmations"
                            name="confirmationIds"
                            onCreate={(name) => handleCreateConfirmation(name)}
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
                            {/* Log the form data */}
                            <Button
                                disabled={isCreatingTrade}
                                onClick={handleClose}
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            disabled={
                                isCreatingTrade || !form.formState.isValid
                            }
                            form="create-trade-form"
                            type="submit"
                        >
                            {isCreatingTrade ? "Creating..." : "Create trade"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
