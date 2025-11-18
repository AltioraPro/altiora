"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
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
import { orpc } from "@/orpc/client";
import {
    type CreateTradingJournalInput,
    createTradingJournalSchema,
} from "@/server/routers/trading/validators";
import { useCreateJournalStore } from "@/store/create-journal-store";

export function CreateJournalModal() {
    const { isOpen, close } = useCreateJournalStore();

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

                onSuccess: () => {
                    reset();
                    close();
                },
            })
        );

    const onSubmit = async (data: CreateTradingJournalInput) => {
        await createJournal(data);
    };

    const isPending = isCreatingJournal || isSubmitting;

    const handleClose = () => {
        if (isPending) {
            return;
        }
        reset();
        close();
    };

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <form id="create-journal-form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Create a new journal
                        </DialogTitle>
                        <DialogDescription>
                            Create a new trading journal to organize your trades
                            and track your performance. Enable percentage
                            calculation for automatic BE/TP/SL detection.
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
                                        errors.name ? [errors.name] : undefined
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
                                        The starting capital allows to calculate
                                        percentages automatically when creating
                                        trades
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
                        <DialogClose asChild>
                            <Button
                                disabled={isPending}
                                onClick={handleClose}
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            disabled={isPending}
                            form="create-journal-form"
                            type="submit"
                        >
                            {isPending ? "Creating..." : "Create journal"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
