"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiAlertLine, RiCheckboxCircleFill } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/client";

const waitlistSchema = z.object({
    firstName: z.string().min(1, "Prénom requis"),
    email: z.string().email("Email invalide"),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

export function WaitlistForm() {
    const [success, setSuccess] = useState(false);
    const [alreadyExists, setAlreadyExists] = useState(false);

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm<WaitlistFormValues>({
        resolver: zodResolver(waitlistSchema),
        defaultValues: {
            firstName: "",
            email: "",
        },
    });

    const { mutate, isPending, error } = useMutation(
        orpc.waitlist.join.mutationOptions({
            onSuccess: (data) => {
                if (data.alreadyExists) {
                    setAlreadyExists(true);
                } else {
                    setSuccess(true);
                    reset();
                }
            },
        })
    );

    const onSubmit = (values: WaitlistFormValues) => {
        setSuccess(false);
        setAlreadyExists(false);
        mutate(values);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
                    <RiCheckboxCircleFill className="size-8 text-green-400" />
                </div>
                <h3 className="font-semibold text-xl">Tu es sur la liste !</h3>
                <p className="text-muted-foreground">
                    Merci de ton intérêt pour Altiora. On te préviendra dès que
                    la beta sera ouverte.
                </p>
            </div>
        );
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <FormInput
                aria-invalid={!!errors.firstName}
                control={control}
                label="Prénom"
                name="firstName"
                placeholder="Ton prénom"
                type="text"
            />

            <FormInput
                aria-invalid={!!errors.email}
                control={control}
                label="Email"
                name="email"
                placeholder="ton@email.com"
                type="email"
            />

            {error && (
                <div className="flex items-center gap-3 border border-destructive bg-destructive/40 p-4">
                    <RiAlertLine className="mt-0.5 size-5 shrink-0 text-white" />
                    <p className="text-sm text-white">{error.message}</p>
                </div>
            )}

            {alreadyExists && (
                <div className="flex items-center gap-3 border border-yellow-500/20 bg-yellow-500/10 p-4">
                    <RiCheckboxCircleFill className="size-5 shrink-0 text-yellow-400" />
                    <p className="text-sm text-yellow-400">
                        Tu es déjà inscrit sur la waitlist !
                    </p>
                </div>
            )}

            <Button
                className="mt-4 w-full"
                disabled={isPending}
                size="lg"
                type="submit"
            >
                {isPending ? (
                    <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current/20 border-t-current" />
                        Inscription...
                    </>
                ) : (
                    "Rejoindre la waitlist"
                )}
            </Button>
        </form>
    );
}
