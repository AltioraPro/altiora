"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { Passkey } from "better-auth/plugins/passkey";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormError } from "@/components/form/form-error";
import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";

const passkeyNameSchema = z.object({
    name: z
        .string()
        .min(1, "Passkey name is required")
        .max(100, "Passkey name must be less than 100 characters"),
});

type PasskeyNameForm = z.infer<typeof passkeyNameSchema>;

interface EditPasskeyModalProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    passkey: Passkey;
    onSuccess?: () => void;
}

export function EditPasskeyModal({
    isOpen,
    setIsOpen,
    passkey,
    onSuccess,
}: EditPasskeyModalProps) {
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const form = useForm<PasskeyNameForm>({
        resolver: zodResolver(passkeyNameSchema),
        defaultValues: {
            name: passkey.name,
        },
    });

    useEffect(() => {
        if (isOpen && passkey.name) {
            form.reset({ name: passkey.name });
        }
    }, [isOpen, passkey.name, form]);

    const handleUpdatePasskey = async (data: PasskeyNameForm) => {
        try {
            setIsUpdating(true);
            await authClient.passkey.updatePasskey({
                id: passkey.id,
                name: data.name,
            });
            queryClient.invalidateQueries({ queryKey: ["passkeys"] });
            setIsOpen(false);
            onSuccess?.();
        } catch {
            setError("Failed to update passkey");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        form.reset();
    };

    return (
        <Dialog onOpenChange={setIsOpen} open={isOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Passkey</DialogTitle>
                    <DialogDescription>
                        Update the name for this passkey to help you identify it
                        later.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(handleUpdatePasskey)}
                >
                    <FormInput
                        control={form.control}
                        disabled={isUpdating}
                        label="Passkey Name"
                        name="name"
                        placeholder="e.g., My MacBook Pro"
                        required
                    />

                    {error && <FormError error={error} />}

                    <DialogFooter>
                        <Button
                            disabled={isUpdating}
                            onClick={handleClose}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button disabled={isUpdating} type="submit">
                            {isUpdating ? "Updating..." : "Update Passkey"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
