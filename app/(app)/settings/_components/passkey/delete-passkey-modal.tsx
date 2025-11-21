"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Passkey } from "better-auth/plugins/passkey";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { FormError } from "@/components/form/form-error";
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

interface DeletePasskeyModalProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    passkey: Passkey;
    onSuccess?: () => void;
}

export function DeletePasskeyModal({
    isOpen,
    setIsOpen,
    passkey,
    onSuccess,
}: DeletePasskeyModalProps) {
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeletePasskey = async () => {
        try {
            setIsDeleting(true);
            await authClient.passkey.deletePasskey({ id: passkey.id });
            queryClient.invalidateQueries({ queryKey: ["passkeys"] });
            setIsOpen(false);
            onSuccess?.();
        } catch {
            setError("Failed to delete passkey");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <Dialog onOpenChange={setIsOpen} open={isOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Passkey</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the passkey &quot;
                        {passkey.name}&quot;? This action cannot be undone and
                        you will need to register this device again to use it
                        for authentication.
                    </DialogDescription>
                </DialogHeader>

                {error && <FormError error={error} />}

                <DialogFooter>
                    <Button
                        disabled={isDeleting}
                        onClick={handleClose}
                        type="button"
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isDeleting}
                        onClick={handleDeletePasskey}
                        type="button"
                        variant="destructive"
                    >
                        {isDeleting ? "Deleting..." : "Delete Passkey"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
