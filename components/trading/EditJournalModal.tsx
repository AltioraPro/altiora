"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/orpc/client";
import {
    type UpdateTradingJournalInput,
    updateTradingJournalSchema,
} from "@/server/routers/trading/validators";
import { useEditJournalStore } from "@/stores/edit-journal-store";

export function EditJournalModal() {
    const { isOpen, journal, close } = useEditJournalStore();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UpdateTradingJournalInput>({
        resolver: zodResolver(updateTradingJournalSchema),
        defaultValues: {
            id: "",
            name: "",
            description: "",
        },
    });

    useEffect(() => {
        if (journal) {
            reset({
                id: journal.id,
                name: journal.name || "",
                description: journal.description || "",
            });
        }
    }, [journal, reset]);

    const { mutateAsync: updateJournal, isPending: isUpdatingJournal } =
        useMutation(
            orpc.trading.updateJournal.mutationOptions({
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

    const onSubmit = async (data: UpdateTradingJournalInput) => {
        if (!journal) {
            return;
        }
        await updateJournal({
            id: journal.id,
            name: data.name,
            description: data.description,
        });
    };

    const isPending = isUpdatingJournal || isSubmitting;

    const handleClose = () => {
        if (isPending) {
            return;
        }
        reset();
        close();
    };

    if (!journal) {
        return null;
    }

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <form id="edit-journal-form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit journal</DialogTitle>
                        <DialogDescription>
                            Edit your trading journal information.
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
                            form="edit-journal-form"
                            type="submit"
                        >
                            {isPending ? "Updating..." : "Update"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
