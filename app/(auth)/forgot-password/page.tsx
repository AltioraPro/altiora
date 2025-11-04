"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Mail,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PAGES } from "@/constants/pages";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        getValues,
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: data.email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to send reset email");
            }

            setIsSuccess(true);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to send reset email";
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
                                Check Your Email
                            </h1>
                            <p className="mb-2 text-gray-400">
                                We&apos;ve sent a password reset link to:
                            </p>
                            <p className="font-medium text-white">
                                {getValues("email")}
                            </p>
                            <p className="mt-4 text-gray-400 text-sm">
                                Click the link in the email to reset your
                                password. The link will expire in 1 hour.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <button
                                className="w-full rounded-lg border border-white/20 bg-transparent py-3 text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5"
                                onClick={() => {
                                    setIsSuccess(false);
                                    setError(null);
                                }}
                                type="button"
                            >
                                Send Another Email
                            </button>

                            <Link
                                className="block w-full rounded-lg border border-white/30 bg-transparent py-3 text-center transition-all duration-300 hover:border-white hover:bg-white/10"
                                href={PAGES.SIGN_IN}
                            >
                                <div className="flex items-center justify-center space-x-3">
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="tracking-widest">
                                        BACK TO LOGIN
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Help text */}
                        <div className="mt-8">
                            <p className="text-gray-400 text-sm">
                                Didn&apos;t receive the email? Check your spam
                                folder or{" "}
                                <button
                                    className="text-white underline hover:text-gray-300"
                                    onClick={() => {
                                        setIsSuccess(false);
                                        setError(null);
                                    }}
                                    type="button"
                                >
                                    try again
                                </button>
                            </p>
                        </div>
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
                            <p className="text-xl">Reset your password.</p>
                            <p className="text-base opacity-80">
                                Enter your email address and we&apos;ll send you
                                a link to reset your password.
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

                        {/* Back link */}
                        <div className="mb-6">
                            <Link
                                className="inline-flex items-center space-x-2 text-sm text-white/60 transition-colors hover:text-white"
                                href={PAGES.SIGN_IN}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to login</span>
                            </Link>
                        </div>

                        {/* Form title */}
                        <div className="mb-8 text-center">
                            <h2 className="mb-2 font-bold text-2xl text-white">
                                Forgot Password
                            </h2>
                            <p className="text-gray-400">
                                Enter your email to receive a password reset
                                link
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
                            {/* Email */}
                            <div>
                                <label
                                    className="mb-2 block font-medium text-white/80 text-xs tracking-widest"
                                    htmlFor="email"
                                >
                                    EMAIL
                                </label>
                                <div className="relative">
                                    <Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-white/40" />
                                    <input
                                        {...register("email")}
                                        className="w-full rounded-lg border border-white/20 bg-transparent py-3 pr-3 pl-10 text-white placeholder-white/40 transition-all duration-300 focus:border-white focus:outline-hidden"
                                        placeholder="your@email.com"
                                        type="email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-red-400 text-sm">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Send reset link button */}
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
                                                SENDING...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="tracking-widest">
                                                SEND RESET LINK
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
