"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    RiAlertLine,
    RiArrowLeftLine,
    RiArrowRightLine,
    RiEyeLine,
    RiEyeOffLine,
    RiLockLine,
} from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
        error: "Passwords don't match",
        path: ["confirmPassword"],
    });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [token] = useQueryState("token");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
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
                                "You're password has been reset successfully",
                        })
                    );
                },
            }
        );

        setIsLoading(false);
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-pure-black text-pure-white">
            {/* Éléments décoratifs géométriques */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-32 right-32 h-6 w-6 rotate-12 border border-white/15" />
                <div className="absolute bottom-40 left-40 h-3 w-3 animate-pulse rounded-full bg-white/10" />
                <div className="absolute right-20 bottom-60 h-8 w-8 rotate-45 border border-white/25" />

                {/* Grille de points subtile */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "50px 50px",
                    }}
                />
            </div>

            <div className="relative z-10 flex min-h-screen">
                {/* Left section - Branding */}
                <div className="hidden flex-col justify-center px-12 lg:flex lg:w-1/2 xl:px-20">
                    <div className="max-w-lg">
                        <h1 className="mb-6 bg-linear-to-b from-white to-gray-400 bg-clip-text font-argesta font-bold text-[4rem] text-transparent leading-none">
                            ALTIORA
                        </h1>

                        <div className="space-y-4 text-gray-300">
                            <p className="text-xl">Create a new password.</p>
                            <p className="text-base opacity-80">
                                Enter a strong password to secure your account.
                            </p>
                        </div>

                        {/* Decorative line */}
                        <div className="mt-12 flex items-center space-x-4">
                            <div className="h-px w-20 bg-linear-to-r from-white to-transparent" />
                            <span className="text-white/60 text-xs tracking-widest">
                                RESET
                            </span>
                            <div className="h-px w-20 bg-linear-to-l from-white to-transparent" />
                        </div>
                    </div>
                </div>

                {/* Right section - Form */}
                <div className="flex flex-1 items-center justify-center p-8 lg:w-1/2">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}
                        <div className="mb-8 text-center lg:hidden">
                            <h1 className="font-argesta font-bold text-3xl text-white">
                                ALTIORA
                            </h1>
                            <p className="mt-2 text-gray-400 text-sm">
                                Personal coaching platform
                            </p>
                        </div>

                        {/* Form title */}
                        <div className="mb-8 text-center">
                            <h2 className="mb-2 font-bold text-2xl text-white">
                                Reset Password
                            </h2>
                            <p className="text-gray-400">
                                Enter your new password below
                            </p>
                        </div>

                        {/* Message d'erreur global */}
                        {errors.password && (
                            <div className="mb-6 flex items-start space-x-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                                <RiAlertLine className="mt-0.5 size-5 shrink-0 text-red-400" />
                                <p className="text-red-400 text-sm">
                                    {errors.password.message}
                                </p>
                            </div>
                        )}

                        {/* Form */}
                        <form
                            className="space-y-6"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            {/* New Password */}
                            <div>
                                <label
                                    className="mb-2 block font-medium text-white/80 text-xs tracking-widest"
                                    htmlFor="password"
                                >
                                    NEW PASSWORD
                                </label>
                                <div className="relative">
                                    <RiLockLine className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-white/40" />
                                    <input
                                        {...register("password")}
                                        className="w-full rounded-lg border border-white/20 bg-transparent py-3 pr-12 pl-10 text-white placeholder-white/40 transition-all duration-300 focus:border-white focus:outline-hidden"
                                        placeholder="••••••••"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                    />
                                    <button
                                        className="-translate-y-1/2 absolute top-1/2 right-3 transform text-white/40 transition-colors hover:text-white/60"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        type="button"
                                    >
                                        {showPassword ? (
                                            <RiEyeOffLine className="size-4" />
                                        ) : (
                                            <RiEyeLine className="size-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-red-400 text-sm">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    className="mb-2 block font-medium text-white/80 text-xs tracking-widest"
                                    htmlFor="confirmPassword"
                                >
                                    CONFIRM PASSWORD
                                </label>
                                <div className="relative">
                                    <RiLockLine className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-white/40" />
                                    <input
                                        {...register("confirmPassword")}
                                        className="w-full rounded-lg border border-white/20 bg-transparent py-3 pr-12 pl-10 text-white placeholder-white/40 transition-all duration-300 focus:border-white focus:outline-hidden"
                                        placeholder="••••••••"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                    />
                                    <button
                                        className="-translate-y-1/2 absolute top-1/2 right-3 transform text-white/40 transition-colors hover:text-white/60"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        type="button"
                                    >
                                        {showConfirmPassword ? (
                                            <RiEyeOffLine className="size-4" />
                                        ) : (
                                            <RiEyeLine className="size-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-red-400 text-sm">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* Reset password button */}
                            <button
                                className="group relative w-full overflow-hidden rounded-lg border border-white/30 bg-transparent py-4 transition-all duration-300 hover:border-white disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isSubmitting || isLoading}
                                type="submit"
                            >
                                {/* Hover effects */}
                                <div className="absolute inset-0 translate-y-full transform bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />

                                <div className="relative flex items-center justify-center space-x-3">
                                    {isSubmitting || isLoading ? (
                                        <>
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                            <span className="tracking-widest">
                                                RESETTING...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="tracking-widest">
                                                RESET PASSWORD
                                            </span>
                                            <RiArrowRightLine className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        {/* Back to home */}
                        <div className="mt-6 text-center">
                            <Button asChild variant="dim">
                                <Link href={PAGES.SIGN_IN}>
                                    <RiArrowLeftLine className="size-4" />
                                    Back to login
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
