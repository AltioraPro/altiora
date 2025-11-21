"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
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
import { getDefaultPasskeyName } from "@/lib/utils/user-agent";

const passkeyNameSchema = z.object({
    name: z
        .string()
        .min(1, "Passkey name is required")
        .max(100, "Passkey name must be less than 100 characters"),
});

type PasskeyNameForm = z.infer<typeof passkeyNameSchema>;

interface AddPasskeyModalProps {
    isModalOpen: boolean;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
    onComplete: () => void;
}

export function AddPasskeyModal({
    isModalOpen,
    setIsModalOpen,
    onComplete,
}: AddPasskeyModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<PasskeyNameForm>({
        resolver: zodResolver(passkeyNameSchema),
        defaultValues: {
            name: "",
        },
    });

    // Set default passkey name when modal opens
    useEffect(() => {
        if (isModalOpen) {
            form.reset({ name: getDefaultPasskeyName() });
        }
    }, [isModalOpen, form]);

    const handleCreatePasskey = async (data: PasskeyNameForm) => {
        try {
            setIsProcessing(true);
            setError(null);

            const response = await authClient.passkey.addPasskey({
                name: data.name,
            });

            if (response?.error) {
                if (response.error.status === 400) {
                    if (response.error.message === "previously registered") {
                        setError("Passkey already registered");
                    } else {
                        setError("Passkey registration canceled or timed out");
                    }
                } else {
                    setError("Failed to create passkey");
                }
                return;
            }

            onComplete();
            handleCloseModal();
        } catch {
            setError("Failed to create passkey");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        form.reset();
    };

    return (
        <Dialog onOpenChange={handleCloseModal} open={isModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Passkey</DialogTitle>
                    <DialogDescription>
                        Enter a name for your new passkey to help you identify
                        it later.
                    </DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(handleCreatePasskey)}
                >
                    <FormInput
                        control={form.control}
                        disabled={isProcessing}
                        label="Passkey Name"
                        name="name"
                        placeholder="e.g. My MacBook Pro"
                        required
                    />
                    {error && <FormError error={error} />}

                    <DialogFooter>
                        <Button
                            disabled={isProcessing}
                            onClick={handleCloseModal}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button disabled={isProcessing} type="submit">
                            {isProcessing ? "Creating..." : "Create Passkey"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
