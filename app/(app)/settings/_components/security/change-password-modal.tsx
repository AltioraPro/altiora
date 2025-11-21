"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { RiCheckboxCircleFill, RiCloseCircleFill } from "@remixicon/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormError } from "@/components/form/form-error";
import { FormPassword } from "@/components/form/form-password";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";

const UPPERCASE_REGEX = /[A-Z]/;
const NUMBER_REGEX = /[0-9]/;

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(8, { error: "Current password is required" }),
        newPassword: z
            .string()
            .min(8, { error: "Password must be at least 8 characters long" })
            .regex(/[A-Z]/, {
                error: "Password must contain at least 1 uppercase letter",
            })
            .regex(/[0-9]/, {
                error: "Password must contain at least 1 number",
            }),
        confirmPassword: z
            .string()
            .min(8, {
                error: "Confirm password must be at least 8 characters long",
            })
            .regex(/[A-Z]/, {
                error: "Confirm password must contain at least 1 uppercase letter",
            })
            .regex(/[0-9]/, {
                error: "Confirm password must contain at least 1 number",
            }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        error: "Passwords don't match",
        path: ["confirmPassword"],
    });

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({
    isOpen,
    onClose,
}: ChangePasswordModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [criteria, setCriteria] = useState({
        length: false,
        uppercase: false,
        number: false,
    });

    const form = useForm({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const { control, handleSubmit, reset, watch } = form;

    const newPassword = watch("newPassword");

    useEffect(() => {
        setCriteria({
            length: newPassword.length >= 8,
            uppercase: UPPERCASE_REGEX.test(newPassword),
            number: NUMBER_REGEX.test(newPassword),
        });
    }, [newPassword]);

    const countTrueCriteria = (criteriaObj: {
        [key: string]: boolean;
    }): number => Object.values(criteriaObj).filter((value) => value).length;

    const trueCriteriaCount = countTrueCriteria(criteria);

    const handleClose = () => {
        if (isLoading) {
            return;
        }
        reset();
        setError(null);
        setSuccess(null);
        onClose();
    };

    async function onSubmit(values: z.infer<typeof changePasswordSchema>) {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const { error: changePasswordError } = await authClient.changePassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
            revokeOtherSessions: true,
        });

        if (changePasswordError) {
            setError(
                changePasswordError?.message ?? "Failed to change password"
            );
            setIsLoading(false);
            return;
        }

        setSuccess("Password changed successfully");
        setIsLoading(false);
    }

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <form id="change-password-form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Change Password
                        </DialogTitle>
                        <DialogDescription>
                            Update your password to keep your account secure.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <FormPassword
                            control={control}
                            disabled={isLoading}
                            label="Current Password"
                            name="currentPassword"
                            required
                        />

                        <FormPassword
                            control={control}
                            disabled={isLoading}
                            label="New Password"
                            name="newPassword"
                            required
                        />

                        <FormPassword
                            control={control}
                            disabled={isLoading}
                            label="Confirm Password"
                            name="confirmPassword"
                            required
                        />

                        <div className="-mt-0.5 space-y-2">
                            {/* Password Strength Indicator */}
                            <div className="flex gap-1">
                                {[1, 2, 3].map((level) => {
                                    let bgColor = "bg-white/10";
                                    if (level <= trueCriteriaCount) {
                                        if (level === 1) {
                                            bgColor = "bg-red-500";
                                        } else if (level === 2) {
                                            bgColor = "bg-yellow-500";
                                        } else {
                                            bgColor = "bg-green-500";
                                        }
                                    }
                                    return (
                                        <div
                                            className={`h-1 flex-1 transition-colors ${bgColor}`}
                                            key={level}
                                        />
                                    );
                                })}
                            </div>
                            <div className="text-white/60 text-xs">
                                Password Requirements:
                            </div>
                            <div className="flex items-center gap-1.5 text-white/60 text-xs">
                                {criteria.uppercase ? (
                                    <RiCheckboxCircleFill className="size-4 shrink-0 text-green-500" />
                                ) : (
                                    <RiCloseCircleFill className="size-4 shrink-0 text-white/40" />
                                )}
                                At least one uppercase letter
                            </div>
                            <div className="flex items-center gap-1.5 text-white/60 text-xs">
                                {criteria.number ? (
                                    <RiCheckboxCircleFill className="size-4 shrink-0 text-green-500" />
                                ) : (
                                    <RiCloseCircleFill className="size-4 shrink-0 text-white/40" />
                                )}
                                At least one number
                            </div>
                            <div className="flex items-center gap-1.5 text-white/60 text-xs">
                                {criteria.length ? (
                                    <RiCheckboxCircleFill className="size-4 shrink-0 text-green-500" />
                                ) : (
                                    <RiCloseCircleFill className="size-4 shrink-0 text-white/40" />
                                )}
                                At least 8 characters
                            </div>
                        </div>

                        {error && <FormError error={error} />}
                        {success && (
                            <div className="flex gap-2 bg-green-500/10 px-4 py-2 text-sm">
                                <RiCheckboxCircleFill
                                    className="mt-0.5 text-green-500"
                                    size={16}
                                />
                                <p>{success}</p>
                            </div>
                        )}
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                disabled={isLoading}
                                onClick={handleClose}
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            disabled={isLoading}
                            form="change-password-form"
                            type="submit"
                        >
                            {isLoading ? (
                                <>
                                    <StaggeredFadeLoader variant="muted" />
                                    Changing...
                                </>
                            ) : (
                                "Change Password"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
