"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";
import {
    type CreateTradingJournalInput,
    createTradingJournalSchema,
} from "@/server/routers/trading/validators";
import { useCreateJournalStore } from "@/store/create-journal-store";

type JournalSource = "manual" | "ctrader" | "metatrader";
type Step = "source" | "details" | "metatrader-setup";
type Platform = "mt4" | "mt5";

export function CreateJournalModal() {
    const router = useRouter();
    const { isOpen, close } = useCreateJournalStore();
    const [step, setStep] = useState<Step>("source");
    const [selectedSource, setSelectedSource] =
        useState<JournalSource>("manual");

    // MetaTrader setup state
    const [createdJournalId, setCreatedJournalId] = useState<string | null>(
        null
    );
    const [webhookToken, setWebhookToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

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
            })
        );

    const { mutateAsync: generateToken, isPending: isGeneratingToken } =
        useMutation(
            orpc.integrations.metatrader.generateToken.mutationOptions()
        );

    const onSubmit = async (data: CreateTradingJournalInput) => {
        await createJournal(data);
        reset();
        close();
        resetState();
    };

    const isPending = isCreatingJournal || isSubmitting || isGeneratingToken;

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
            } catch (_error) {
                toast.error("Failed to create journal");
            }
        } else if (selectedSource === "metatrader") {
            // Create journal and generate token directly
            try {
                const journal = await createJournal({
                    name: "MetaTrader Account",
                    description: "Auto-synced from MetaTrader",
                    startingCapital: "10000",
                    usePercentageCalculation: true,
                });
                setCreatedJournalId(journal.id);

                // Generate webhook token
                const result = await generateToken({
                    journalId: journal.id,
                    platform: "mt5", // Default to MT5, token works for both
                });
                setWebhookToken(result.webhookToken);

                // Go to setup instructions
                setStep("metatrader-setup");
                toast.success(
                    "Journal created! Now configure your MetaTrader EA."
                );
            } catch (error) {
                console.error("MetaTrader setup error:", error);
                toast.error("Failed to setup MetaTrader");
            }
        }
    };

    const handleCopyToken = async () => {
        if (webhookToken) {
            await navigator.clipboard.writeText(webhookToken);
            setCopied(true);
            toast.success("Token copied!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCopyUrl = async () => {
        const url = `${window.location.origin}/api/integrations/metatrader/webhook`;
        await navigator.clipboard.writeText(url);
        toast.success("URL copied!");
    };

    const handleDownloadEA = (platform: Platform) => {
        if (!webhookToken) {
            toast.error("Token not generated yet");
            return;
        }
        const downloadUrl = `/api/integrations/metatrader/download-ea?platform=${platform}&token=${encodeURIComponent(webhookToken)}`;
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.click();
        toast.success("EA downloaded with your token");
    };

    const handleFinishMetaTrader = () => {
        if (createdJournalId) {
            close();
            resetState();
            router.push(`/trading/journals/${createdJournalId}`);
        }
    };

    const resetState = () => {
        setTimeout(() => {
            setStep("source");
            setSelectedSource("manual");
            setCreatedJournalId(null);
            setWebhookToken(null);
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
            description: "Connect MT4/MT5 via Expert Advisor",
        },
    ] as const;

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent className="sm:max-w-[600px]">
                {step === "source" && (
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
                                            const isSelected =
                                                selectedSource === option.value;

                                            return (
                                                <button
                                                    className={cn(
                                                        "flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                                                        isSelected
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
                                                    )}
                                                    key={option.value}
                                                    onClick={() =>
                                                        setSelectedSource(
                                                            option.value
                                                        )
                                                    }
                                                    type="button"
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
                                                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                                                            isSelected
                                                                ? "border-primary bg-primary"
                                                                : "border-muted-foreground/25"
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
                                <Button
                                    disabled={isPending}
                                    type="button"
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                disabled={isPending}
                                onClick={handleContinue}
                                type="button"
                            >
                                {isPending ? "Creating..." : "Continue"}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === "details" && (
                    <form
                        id="create-journal-form"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <DialogHeader>
                            <DialogTitle>Create a new journal</DialogTitle>
                            <DialogDescription>
                                Create a new trading journal to organize your
                                trades and track your performance. Enable
                                percentage calculation for automatic BE/TP/SL
                                detection.
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            <Field data-invalid={!!errors.name}>
                                <FieldLabel htmlFor="name">
                                    Journal name *
                                </FieldLabel>
                                <FieldContent>
                                    <Input
                                        disabled={isPending}
                                        id="name"
                                        placeholder="Ex: Main Journal"
                                        {...register("name")}
                                    />
                                    <FieldError
                                        errors={
                                            errors.name
                                                ? [errors.name]
                                                : undefined
                                        }
                                    />
                                </FieldContent>
                            </Field>

                            <Field data-invalid={!!errors.description}>
                                <FieldLabel htmlFor="description">
                                    Description
                                </FieldLabel>
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
                                            errors.description
                                                ? [errors.description]
                                                : undefined
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
                                                onCheckedChange={(checked) =>
                                                    field.onChange(checked)
                                                }
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
                                            The starting capital allows to
                                            calculate percentages automatically
                                            when creating trades
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

                {step === "metatrader-setup" && webhookToken && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Connect MetaTrader</DialogTitle>
                            <DialogDescription>
                                Follow these steps to start syncing your trades
                                automatically
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Step 1: Download */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-xs">
                                        1
                                    </span>
                                    <span className="font-medium">
                                        Download the Expert Advisor
                                    </span>
                                </div>
                                <div className="ml-8 space-y-2">
                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1"
                                            onClick={() =>
                                                handleDownloadEA("mt5")
                                            }
                                            variant="outline"
                                        >
                                            MetaTrader 5
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={() =>
                                                handleDownloadEA("mt4")
                                            }
                                            variant="outline"
                                        >
                                            MetaTrader 4
                                        </Button>
                                    </div>
                                    <p className="text-muted-foreground text-xs">
                                        Place the file in your{" "}
                                        <code className="text-foreground">
                                            Experts
                                        </code>{" "}
                                        folder
                                    </p>
                                </div>
                            </div>

                            {/* Step 2: Token */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-xs">
                                        2
                                    </span>
                                    <span className="font-medium">
                                        Copy your token
                                    </span>
                                </div>
                                <div className="ml-8">
                                    <div className="flex gap-2">
                                        <Input
                                            className="font-mono text-sm"
                                            readOnly
                                            value={webhookToken}
                                        />
                                        <Button
                                            className="w-20 shrink-0"
                                            onClick={handleCopyToken}
                                            variant={
                                                copied ? "primary" : "outline"
                                            }
                                        >
                                            {copied ? "Copied" : "Copy"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: WebRequest */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-xs">
                                        3
                                    </span>
                                    <span className="font-medium">
                                        Allow web requests
                                    </span>
                                </div>
                                <div className="ml-8 space-y-2">
                                    <p className="text-muted-foreground text-sm">
                                        In MetaTrader:{" "}
                                        <span className="text-foreground">
                                            Tools → Options → Expert Advisors
                                        </span>
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        Enable web requests and add this URL:
                                    </p>
                                    <div className="flex gap-2">
                                        <Input
                                            className="font-mono text-xs"
                                            readOnly
                                            value={
                                                typeof window !== "undefined"
                                                    ? `${window.location.origin}/api/integrations/metatrader/webhook`
                                                    : "https://altiora.app/api/integrations/metatrader/webhook"
                                            }
                                        />
                                        <Button
                                            className="w-20 shrink-0"
                                            onClick={handleCopyUrl}
                                            variant="outline"
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={handleFinishMetaTrader}
                                type="button"
                            >
                                Go to Journal
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
