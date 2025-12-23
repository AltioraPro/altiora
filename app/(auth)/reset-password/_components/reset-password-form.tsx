"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiArrowLeftLine, RiLockLine } from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth-client";
import { withQuery } from "@/lib/utils/routes";

export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters long"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [token] = useQueryState("token");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ResetPasswordFormValues) => {
        setIsLoading(true);
        if (!token) {
            return;
        }

        await authClient.resetPassword(
            {
                token,
                newPassword: data.password,
            },
            {
                onError: (ctx) => {
                    setError("password", {
                        message: ctx.error.message,
                    });
                    setIsLoading(false);
                },
                onSuccess: () => {
                    router.push(
                        withQuery(PAGES.SIGN_IN, {
                            message:
                                "Your password has been reset successfully",
                        })
                    );
                },
            }
        );

        setIsLoading(false);
    };

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="w-full max-w-[472px] px-4">
                <form
                    className="flex w-full flex-col gap-6 p-5 md:p-8"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className="relative flex size-[68px] shrink-0 items-center justify-center lg:size-24">
                            <div className="relative z-10 flex size-12 items-center justify-center bg-neutral-900 ring-1 ring-neutral-800 ring-inset lg:size-16">
                                <RiLockLine className="size-6 text-text-sub-600 lg:size-8" />
                            </div>
                        </div>

                        <div className="space-y-1 text-center">
                            <div className="mb-2 font-semibold text-2xl">
                                Reset Password
                            </div>
                            <div className="text-neutral-400 text-sm">
                                Enter a strong password to secure your account.
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label
                                className="font-medium text-neutral-400 text-sm"
                                htmlFor="password"
                            >
                                New Password
                            </label>
                            <Input
                                {...register("password")}
                                id="password"
                                placeholder="••••••••"
                                type="password"
                            />
                            {errors.password && (
                                <p className="text-destructive text-sm">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                className="font-medium text-neutral-400 text-sm"
                                htmlFor="confirmPassword"
                            >
                                Confirm Password
                            </label>
                            <Input
                                {...register("confirmPassword")}
                                id="confirmPassword"
                                placeholder="••••••••"
                                type="password"
                            />
                            {errors.confirmPassword && (
                                <p className="text-destructive text-sm">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button
                            disabled={isLoading}
                            type="submit"
                            variant="primary"
                        >
                            {isLoading ? (
                                <>
                                    <StaggeredFadeLoader variant="muted" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={PAGES.SIGN_IN}>
                                <RiArrowLeftLine className="size-4" />
                                Back to Login
                            </Link>
                        </Button>
                    </div>

                    <div className="flex flex-col items-center gap-1 text-center text-neutral-400 text-sm">
                        If you have issues, contact support at{" "}
                        <a
                            className="text-primary hover:text-primary/90"
                            href="mailto:support@altiora.com"
                        >
                            support@altiora.com
                        </a>
                        .
                    </div>
                </form>
            </div>
        </div>
    );
}
