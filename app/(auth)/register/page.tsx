"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    RiAlertLine,
    RiArrowRightLine,
    RiCheckboxCircleLine,
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
import { z } from "zod";
import { PAGES } from "@/constants/pages";
import { signIn, signUp } from "@/lib/auth-client";
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

const registerSchema = z
    .object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z
            .string()
            .min(6, "Password must be at least 6 characters"),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        acceptTerms: z
            .boolean()
            .refine((val) => val === true, "You must accept the terms"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            acceptTerms: false,
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setAuthError(null);

        try {
            const { data: result, error } = await signUp.email({
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                password: data.password,
            });

            if (error) {
                if (
                    error.message?.includes("existing email") ||
                    error.status === 422
                ) {
                    setAuthError(
                        "This email is already registered. Please use a different email or sign in."
                    );
                } else {
                    setAuthError(error.message || "Registration error");
                }
            } else if (result?.user) {
                router.push(
                    withQuery(PAGES.VERIFICATION, { email: data.email })
                );
            }
        } catch (error: unknown) {
            let errorMessage = "Registration error";

            if (error instanceof Error) {
                if (
                    error.message.includes("422") ||
                    error.message.includes("existing email")
                ) {
                    errorMessage =
                        "This email is already registered. Please use a different email or sign in.";
                } else {
                    errorMessage = error.message;
                }
            }

            setAuthError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        setAuthError(null);

        try {
            const { error } = await signIn.social({
                provider: "google",
                callbackURL: PAGES.DASHBOARD,
            });

            if (error) {
                if (error.message?.includes("unable_to_link_account")) {
                    router.push(
                        withQuery(PAGES.ERROR, {
                            error: "unable_to_link_account",
                        })
                    );
                    return;
                }
                if (error.message?.includes("access_denied")) {
                    router.push(
                        withQuery(PAGES.ERROR, { error: "access_denied" })
                    );
                    return;
                }
                if (error.message?.includes("oauth_callback_error")) {
                    router.push(
                        withQuery(PAGES.ERROR, {
                            error: "oauth_callback_error",
                        })
                    );
                    return;
                }
                setAuthError(
                    error.message || "Google sign-up failed. Please try again."
                );
            }
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "Google sign-up error";
            setAuthError(errorMessage);
        } finally {
            setIsLoading(false);
        }
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
                            <p className="text-xl">
                                Start your transformation.
                            </p>
                            <p className="text-base opacity-80">
                                Create your account and join a community
                                dedicated to excellence in trading and personal
                                development.
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="mt-8 space-y-3">
                            {[
                                "Professional trading journal",
                                "Smart habit tracking",
                                "Goal planning",
                                "Discord integration",
                            ].map((benefit, index) => (
                                <div
                                    className="flex items-center space-x-3"
                                    key={index}
                                >
                                    <RiCheckboxCircleLine className="size-4 text-white/60" />
                                    <span className="text-sm text-white/70">
                                        {benefit}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Decorative line */}
                        <div className="mt-12 flex items-center space-x-4">
                            <div className="h-px w-20 bg-linear-to-r from-white to-transparent" />
                            <span className="text-white/60 text-xs tracking-widest">
                                SIGN UP
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
                                Create Account
                            </h2>
                            <p className="text-gray-400">
                                Join thousands of users who are transforming
                                their lives
                            </p>
                        </div>

                        {/* Message d'erreur global */}
                        {authError && (
                            <div className="mb-6 flex items-start space-x-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                                <RiAlertLine className="mt-0.5 size-5 shrink-0 text-red-400" />
                                <p className="text-red-400 text-sm">
                                    {authError}
                                </p>
                            </div>
                        )}

                        {/* Form */}
                        <form
                            className="space-y-6"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            {/* First and Last Name */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className="mb-2 block font-medium text-white/80 text-xs tracking-widest"
                                        htmlFor="firstName"
                                    >
                                        FIRST NAME
                                    </label>
                                    <div className="relative">
                                        <RiUserLine className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-white/40" />
                                        <input
                                            {...register("firstName")}
                                            className="w-full rounded-lg border border-white/20 bg-transparent py-3 pr-3 pl-10 text-white placeholder-white/40 transition-all duration-300 focus:border-white focus:outline-hidden"
                                            placeholder="John"
                                            type="text"
                                        />
                                    </div>
                                    {errors.firstName && (
                                        <p className="mt-1 text-red-400 text-sm">
                                            {errors.firstName.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        className="mb-2 block font-medium text-white/80 text-xs tracking-widest"
                                        htmlFor="lastName"
                                    >
                                        LAST NAME
                                    </label>
                                    <div className="relative">
                                        <RiUserLine className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-white/40" />
                                        <input
                                            {...register("lastName")}
                                            className="w-full rounded-lg border border-white/20 bg-transparent py-3 pr-3 pl-10 text-white placeholder-white/40 transition-all duration-300 focus:border-white focus:outline-hidden"
                                            placeholder="Doe"
                                            type="text"
                                        />
                                    </div>
                                    {errors.lastName && (
                                        <p className="mt-1 text-red-400 text-sm">
                                            {errors.lastName.message}
                                        </p>
                                    )}
                                </div>
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
            </div>
        </div>
    );
}
