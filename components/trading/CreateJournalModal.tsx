"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/orpc/client";
import {
    type CreateTradingJournalInput,
    createTradingJournalSchema,
} from "@/server/routers/trading/validators";
import { useCreateJournalStore } from "@/store/create-journal-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type JournalSource = "manual" | "ctrader" | "metatrader";

export function CreateJournalModal() {
    const router = useRouter();
    const { isOpen, close } = useCreateJournalStore();
    const [step, setStep] = useState<"source" | "details">("source");
    const [selectedSource, setSelectedSource] = useState<JournalSource>("manual");

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateTradingJournalInput>({
        resolver: zodResolver(createTradingJournalSchema),
        defaultValues: {
            name: "",
            description: "",
            startingCapital: "",
            usePercentageCalculation: false,
        },
    });

    const usePercentageCalculation = watch("usePercentageCalculation");

    const { mutateAsync: createJournal, isPending: isCreatingJournal } =
        useMutation(
            orpc.trading.createJournal.mutationOptions({
                meta: {
                    invalidateQueries: [
                        orpc.trading.getJournals.queryKey({ input: {} }),
                    ],
                },
            }),
        );

    const onSubmit = async (data: CreateTradingJournalInput) => {
        await createJournal(data);
        reset();
        close();
        resetState();
    };

    const isPending = isCreatingJournal || isSubmitting;

    const handleContinue = async () => {
        if (selectedSource === "manual") {
            setStep("details");
        } else if (selectedSource === "ctrader") {
            // Create a temporary journal for cTrader
            try {
                const journal = await createJournal({
                    name: "cTrader Account",
                    description: "Auto-synced from cTrader",
                    startingCapital: "10000",
                    usePercentageCalculation: true,
                });

                close();
                resetState();
                // Redirect directly to cTrader OAuth
                window.location.href = `/api/integrations/ctrader/authorize?journalId=${journal.id}`;
            } catch (error) {
                toast.error("Failed to create journal");
            }
        } else if (selectedSource === "metatrader") {
            close();
            resetState();
            toast.info("MetaTrader integration coming soon!");
        }
    };

    const resetState = () => {
        setTimeout(() => {
            setStep("source");
            setSelectedSource("manual");
        }, 200);
    };

    const handleClose = () => {
        if (isPending) {
            return;
        }
        reset();
        close();
        resetState();
    };

    const sourceOptions = [
        {
            value: "manual",
            label: "Manual journal",
            description: "Create and manually log your trades",
        },
        {
            value: "ctrader",
            label: "cTrader",
            description: "Auto-sync from cTrader account",
        },
        {
            value: "metatrader",
            label: "MetaTrader 4/5",
            description: "Connect MT4/MT5 account (coming soon)",
        },
    ] as const;

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent>
                {step === "source" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Create a new journal</DialogTitle>
                            <DialogDescription>
                                Choose how you want to track your trades
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup>
                            <Field>
                                <FieldLabel>Journal Type</FieldLabel>
                                <FieldContent>
                                    <div className="space-y-2">
                                        {sourceOptions.map((option) => {
                                            const isSelected = selectedSource === option.value;

                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => setSelectedSource(option.value)}
                                                    className={cn(
                                                        "w-full flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                                                        isSelected
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50",
                                                    )}
                                                >
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">
                                                            {option.label}
                                                        </div>
                                                        <p className="text-muted-foreground text-sm">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 mt-0.5",
                                                            isSelected
                                                                ? "border-primary bg-primary"
                                                                : "border-muted-foreground/25",
                                                        )}
                                                    >
                                                        {isSelected && (
                                                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </FieldContent>
                            </Field>
                        </FieldGroup>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={isPending}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="button" onClick={handleContinue} disabled={isPending}>
                                {isPending ? "Creating..." : "Continue"}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <form id="create-journal-form" onSubmit={handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Create a new journal</DialogTitle>
                            <DialogDescription>
                                Create a new trading journal to organize your trades and track
                                your performance. Enable percentage calculation for automatic
                                BE/TP/SL detection.
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            <Field data-invalid={!!errors.name}>
                                <FieldLabel htmlFor="name">Journal name *</FieldLabel>
                                <FieldContent>
                                    <Input
                                        disabled={isPending}
                                        id="name"
                                        placeholder="Ex: Main Journal"
                                        {...register("name")}
                                    />
                                    <FieldError
                                        errors={errors.name ? [errors.name] : undefined}
                                    />
                                </FieldContent>
                            </Field>

                            <Field data-invalid={!!errors.description}>
                                <FieldLabel htmlFor="description">Description</FieldLabel>
                                <FieldContent>
                                    <Textarea
                                        disabled={isPending}
                                        id="description"
                                        placeholder="Optional journal description"
                                        rows={3}
                                        {...register("description")}
                                    />
                                    <FieldError
                                        errors={
                                            errors.description ? [errors.description] : undefined
                                        }
                                    />
                                </FieldContent>
                            </Field>

                            <Field
                                data-invalid={!!errors.usePercentageCalculation}
                                orientation="horizontal"
                            >
                                <Controller
                                    control={control}
                                    name="usePercentageCalculation"
                                    render={({ field }) => (
                                        <>
                                            <Checkbox
                                                checked={field.value}
                                                disabled={isPending}
                                                id="usePercentageCalculation"
                                                onCheckedChange={(checked) => field.onChange(checked)}
                                            />
                                            <FieldLabel htmlFor="usePercentageCalculation">
                                                Use percentage calculation
                                            </FieldLabel>
                                        </>
                                    )}
                                />
                                <FieldError
                                    errors={
                                        errors.usePercentageCalculation
                                            ? [errors.usePercentageCalculation]
                                            : undefined
                                    }
                                />
                            </Field>

                            {usePercentageCalculation && (
                                <Field data-invalid={!!errors.startingCapital}>
                                    <FieldLabel htmlFor="startingCapital">
                                        Starting capital
                                    </FieldLabel>
                                    <FieldContent>
                                        <Input
                                            disabled={isPending}
                                            id="startingCapital"
                                            placeholder="Ex: 10000"
                                            step="0.01"
                                            type="number"
                                            {...register("startingCapital")}
                                        />
                                        <FieldDescription>
                                            The starting capital allows to calculate percentages
                                            automatically when creating trades
                                        </FieldDescription>
                                        <FieldError
                                            errors={
                                                errors.startingCapital
                                                    ? [errors.startingCapital]
                                                    : undefined
                                            }
                                        />
                                    </FieldContent>
                                </Field>
                            )}
                        </FieldGroup>
                        <DialogFooter>
                            <Button
                                disabled={isPending}
                                onClick={() => setStep("source")}
                                type="button"
                                variant="outline"
                            >
                                Back
                            </Button>
                            <Button
                                disabled={isPending}
                                form="create-journal-form"
                                type="submit"
                            >
                                {isPending ? "Creating..." : "Create journal"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
