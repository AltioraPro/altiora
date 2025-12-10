"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    RiAlertLine,
    RiArrowRightLine,
    RiEyeLine,
    RiEyeOffLine,
    RiLockLine,
    RiMailLine,
    RiUserLine,
} from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import sendVerificationOtp from "@/app/(auth)/_lib/send-verification-otp";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PAGES } from "@/constants/pages";
import { type SignUpFormValues, signUpSchema } from "@/lib/auth/validators";
import { authClient } from "@/lib/auth-client";
import { withQuery } from "@/lib/utils/routes";

const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
        <title>Google Icon</title>
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="currentColor"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="currentColor"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="currentColor"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="currentColor"
        />
    </svg>
);

export function SignUpForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            fullName: "",
            acceptTerms: false,
        },
    });

    function onSubmit(values: SignUpFormValues) {
        setError(null);
        setIsLoading(true);

        authClient.signUp.email(
            {
                name: values.fullName,
                email: values.email,
                password: values.password,
            },
            {
                onError: (ctx) => {
                    switch (ctx.error.code) {
                        case AUTH_ERRORS.USER_ALREADY_EXISTS:
                            setError("User already exists");
                            break;
                        default:
                            setError(ctx.error.message);
                    }
                    setIsLoading(false);
                },
                onSuccess: () => {
                    sendVerificationOtp(values.email)
                        .then((redirectUrl) => {
                            router.push(redirectUrl);
                        })
                        .catch((signUpError) => {
                            setIsLoading(false);
                            setError(signUpError as string);
                        });
                },
            }
        );
    }

    const handleGoogleSignUp = () => {
        setIsLoading(true);
        setError(null);

        authClient.signIn.social(
            {
                provider: "google",
                callbackURL: PAGES.DASHBOARD,
            },
            {
                onError: (ctx) => {
                    switch (ctx.error.message) {
                        case "unable_to_link_account":
                            router.push(
                                withQuery(PAGES.ERROR, {
                                    error: "unable_to_link_account",
                                })
                            );
                            break;
                        case "access_denied":
                            router.push(
                                withQuery(PAGES.ERROR, {
                                    error: "access_denied",
                                })
                            );
                            break;
                        case "oauth_callback_error":
                            router.push(
                                withQuery(PAGES.ERROR, {
                                    error: "oauth_callback_error",
                                })
                            );
                            break;
                        default:
                            setError(ctx.error.message);
                    }
                },
            }
        );

        setIsLoading(false);
    };

    return (
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
                        Create Account
                    </h2>
                    <p className="text-gray-400">
                        Join thousands of users who are transforming their lives
                    </p>
                </div>

                {/* Message d'erreur global */}
                {error && (
                    <div className="mb-6 flex items-start space-x-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                        <RiAlertLine className="mt-0.5 size-5 shrink-0 text-red-400" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label
                            className="mb-2 block font-medium text-white/80 text-xs tracking-widest"
                            htmlFor="fullName"
                        >
                            FULL NAME
                        </label>
                        <div className="relative">
                            <RiUserLine className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-white/40" />
                            <input
                                {...register("fullName")}
                                className="w-full rounded-lg border border-white/20 bg-transparent py-3 pr-3 pl-10 text-white placeholder-white/40 transition-all duration-300 focus:border-white focus:outline-hidden"
                                placeholder="John Doe"
                                type="text"
                            />
                        </div>
                        {errors.fullName && (
                            <p className="mt-1 text-red-400 text-sm">
                                {errors.fullName.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            className="mb-2 block font-medium text-white/80 text-xs tracking-widest"
                            htmlFor="email"
                        >
                            EMAIL
                        </label>
                        <div className="relative">
                            <RiMailLine className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-white/40" />
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

                    {/* Password */}
                    <div>
                        <label
                            className="mb-2 block font-medium text-white/80 text-xs tracking-widest"
                            htmlFor="password"
                        >
                            PASSWORD
                        </label>
                        <div className="relative">
                            <RiLockLine className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-white/40" />
                            <input
                                {...register("password")}
                                className="w-full rounded-lg border border-white/20 bg-transparent py-3 pr-12 pl-10 text-white placeholder-white/40 transition-all duration-300 focus:border-white focus:outline-hidden"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                            />
                            <button
                                className="-translate-y-1/2 absolute top-1/2 right-3 transform text-white/40 transition-colors hover:text-white/60"
                                onClick={() => setShowPassword(!showPassword)}
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

                    {/* Terms acceptance */}
                    <div>
                        <label className="flex cursor-pointer items-start space-x-3">
                            <input
                                {...register("acceptTerms")}
                                className="mt-1 h-4 w-4 rounded border border-white/20 bg-transparent text-white focus:ring-white/20"
                                type="checkbox"
                            />
                            <span className="text-sm text-white/80 leading-relaxed">
                                I accept the{" "}
                                <Link
                                    className="text-white underline hover:text-gray-300"
                                    href={PAGES.TERMS_OF_SERVICE}
                                >
                                    terms of service
                                </Link>{" "}
                                and{" "}
                                <Link
                                    className="text-white underline hover:text-gray-300"
                                    href={PAGES.PRIVACY_POLICY}
                                >
                                    privacy policy
                                </Link>
                            </span>
                        </label>
                        {errors.acceptTerms && (
                            <p className="mt-1 text-red-400 text-sm">
                                {errors.acceptTerms.message}
                            </p>
                        )}
                    </div>

                    {/* Sign up button */}
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
                                        CREATING...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="tracking-widest">
                                        CREATE ACCOUNT
                                    </span>
                                    <RiArrowRightLine className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </>
                            )}
                        </div>
                    </button>
                </form>

                {/* Divider */}
                <div className="mt-8 mb-6 flex items-center">
                    <div className="h-px flex-1 bg-white/20" />
                    <span className="px-4 text-white/60 text-xs tracking-widest">
                        OR
                    </span>
                    <div className="h-px flex-1 bg-white/20" />
                </div>

                {/* Google Sign Up */}
                <button
                    className="group relative w-full overflow-hidden rounded-lg border border-white/20 bg-transparent py-3 transition-all duration-300 hover:border-white/40 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                    onClick={handleGoogleSignUp}
                    type="button"
                >
                    <div className="relative flex items-center justify-center space-x-3">
                        <GoogleIcon />
                        <span className="font-medium text-sm">
                            Continue with Google
                        </span>
                    </div>
                </button>

                {/* Sign in link */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400">
                        Already have an account?{" "}
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
    );
}
