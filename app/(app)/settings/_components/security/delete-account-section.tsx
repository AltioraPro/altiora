"use client";

import { RiDeleteBinLine, RiErrorWarningLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { orpc } from "@/orpc/client";
import { signOut } from "@/server/actions/sign-out";

export function DeleteAccountSection() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { mutateAsync: deleteAccount, isPending: isDeleting } = useMutation(
        orpc.auth.deleteAccount.mutationOptions({
            onSuccess: () => {
                // After account deletion, sign out and redirect
                signOut();
            },
        })
    );

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount({});
        } catch (error) {
            console.error("Error deleting account:", error);
        } finally {
            setIsDialogOpen(false);
        }
    };

    return (
        <div>
            <div className="mb-2 flex items-center gap-2 text-destructive">
                <RiErrorWarningLine size={16} />
                <p>Danger Zone</p>
            </div>
            <div className="border border-red-500/20 bg-red-950/30 p-6">
                <h3 className="mb-2 font-semibold text-white">
                    Delete Account
                </h3>
                <p className="mb-4 text-sm text-white/60">
                    Once you delete your account, there is no going back. This
                    action cannot be undone and will permanently delete your
                    account and all data.
                </p>
                <Button
                    disabled={isDeleting}
                    onClick={() => setIsDialogOpen(true)}
                    size="sm"
                    variant="destructive"
                >
                    <RiDeleteBinLine className="mr-2 size-4" />
                    Delete Account
                </Button>
            </div>

            <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                            Are you absolutely sure you want to delete your
                            account? This action cannot be undone and will
                            permanently delete:
                        </DialogDescription>
                        <DialogBody>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                                <li>Your profile and account information</li>
                                <li>All your trading journals and trades</li>
                                <li>All your habits and progress</li>
                                <li>All your goals and achievements</li>
                                <li>All your sessions and settings</li>
                            </ul>
                        </DialogBody>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            disabled={isDeleting}
                            onClick={() => setIsDialogOpen(false)}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isDeleting}
                            onClick={handleDeleteAccount}
                            type="button"
                            variant="destructive"
                        >
                            {isDeleting ? "Deleting..." : "Delete Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
