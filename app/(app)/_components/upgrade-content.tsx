"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { PricingCard } from "@/components/pricing-card";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PRICING_PLANS } from "@/constants/pricing";
import { PROJECT } from "@/constants/project";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/orpc/client";
import { signOut } from "@/server/actions/sign-out";

type UpgradeContentProps = {
    userName: string | null;
};

export function UpgradeContent({ userName }: UpgradeContentProps) {
    const [isPending, setIsPending] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const { addToast } = useToast();

    const { mutateAsync: deleteAccount, isPending: isDeleting } = useMutation(
        orpc.auth.deleteAccount.mutationOptions({
            onSuccess: () => {
                signOut();
            },
            onError: () => {
                addToast({
                    type: "error",
                    title: "Error",
                    message: "Failed to delete account. Please try again.",
                });
            },
        })
    );

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== "DELETE") {
            return;
        }

        await deleteAccount({});

        setIsDeleteDialogOpen(false);
        setDeleteConfirmation("");
    };

    const handleOpenDeleteDialog = () => {
        setDeleteConfirmation("");
        setIsDeleteDialogOpen(true);
    };

    const handleSubscribe = async () => {
        setIsPending(true);

        const { error } = await authClient.subscription.upgrade({
            plan: "pro",
            successUrl: "/dashboard?subscription=success",
            cancelUrl: "/dashboard?subscription=canceled",
        });

        if (error) {
            addToast({
                type: "error",
                title: "Error",
                message: error.message,
            });
        }

        setIsPending(false);
    };

    return (
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
            <div className="w-full max-w-4xl p-6 pt-12">
                <div className="mb-6 md:mt-6 max-w-xl text-balance">
                    <h1 className="mb-2 font-semibold text-xl leading-none tracking-tight">
                        Unlock Full Access to {PROJECT.NAME}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {userName ? `Hi ${userName}, ` : ""}Your trial has ended
                        or your subscription has expired — choose a plan to
                        continue using all of {PROJECT.NAME}&apos;s features.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {PRICING_PLANS.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            buttonVariant="outline"
                            footnoteOverride={
                                plan.id === "performance"
                                    ? "No Card Required"
                                    : "Limited Spots"
                            }
                            customAction={
                                plan.id === "performance" ? (
                                    <Button
                                        className="w-full"
                                        disabled={isPending}
                                        onClick={handleSubscribe}
                                    >
                                        {isPending
                                            ? "Redirecting..."
                                            : "Subscribe"}
                                    </Button>
                                ) : undefined
                            }
                        />
                    ))}
                </div>

                <p className="mt-8 text-center text-muted-foreground text-sm">
                    Don&apos;t want to continue?{" "}
                    <button
                        type="button"
                        onClick={handleOpenDeleteDialog}
                        className="hover:underline"
                    >
                        delete your account
                    </button>
                </p>
            </div>

            <Dialog
                onOpenChange={setIsDeleteDialogOpen}
                open={isDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. All your data will be
                            permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                        <p className="mb-3 text-sm">
                            Type{" "}
                            <span className="font-semibold text-foreground">
                                DELETE
                            </span>{" "}
                            to confirm:
                        </p>
                        <Input
                            value={deleteConfirmation}
                            onChange={(e) =>
                                setDeleteConfirmation(e.target.value)
                            }
                            placeholder="DELETE"
                            disabled={isDeleting}
                        />
                    </DialogBody>
                    <DialogFooter>
                        <Button
                            disabled={isDeleting}
                            onClick={() => setIsDeleteDialogOpen(false)}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={
                                isDeleting || deleteConfirmation !== "DELETE"
                            }
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
