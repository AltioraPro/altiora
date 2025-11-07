"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle,
    Eye,
    EyeOff,
    Lock,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PAGES } from "@/constants/pages";

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z
            .string()
            .min(6, "Password must be at least 6 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const searchParams = useSearchParams();

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setError("Invalid or missing reset token");
        }
    }, [searchParams]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ResetPasswordFormValues) => {
        if (!token) {
            setError("Invalid reset token");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/reset-password/confirm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to reset password");
            }

            setIsSuccess(true);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to reset password";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
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

                <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
                    <div className="w-full max-w-md text-center">
                        {/* Success icon */}
                        <div className="mb-8 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                        </div>

                        {/* Success message */}
                        <div className="mb-8">
                            <h1 className="mb-4 font-bold text-2xl text-white">
                                Password Reset Successful
                            </h1>
                            <p className="text-gray-400">
                                Your password has been successfully reset. You
                                can now sign in with your new password.
                            </p>
                        </div>

                        {/* Action */}
                        <Link
                            className="group relative inline-block w-full overflow-hidden rounded-lg border border-white/30 bg-transparent py-4 transition-all duration-300 hover:border-white"
                            href={PAGES.SIGN_IN}
                        >
                            {/* Hover effects */}
                            <div className="absolute inset-0 translate-y-full transform bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />

                            <div className="relative flex items-center justify-center space-x-3">
                                <span className="tracking-widest">SIGN IN</span>
                                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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
                            xxc
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
                        {error && (
                            <div className="mb-6 flex items-start space-x-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                                <p className="text-red-400 text-sm">{error}</p>
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
                                    <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-white/40" />
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
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
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
                                    <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-white/40" />
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
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
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
                                disabled={isSubmitting || isLoading || !token}
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
                                            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        {/* Login link */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-400">
                                Remember your password?{" "}
                                <Link
                                    className="font-medium text-white transition-colors hover:text-gray-300"
                                    href={PAGES.SIGN_IN}
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        {/* Back to home */}
                        <div className="mt-6 text-center">
                            <Link
                                className="text-sm text-white/60 transition-colors hover:text-white/80"
                                href={PAGES.LANDING_PAGE}
                            >
                                ← Back to home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-pure-black text-pure-white">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
