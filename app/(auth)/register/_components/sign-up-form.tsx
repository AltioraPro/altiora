"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiAlertLine } from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import sendVerificationOtp from "@/app/(auth)/_lib/send-verification-otp";
import { FormInput } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    const lastLoginMethod = useMemo(
        () => authClient.getLastUsedLoginMethod(),
        []
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        control,
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            fullName: "",
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
        <div className="w-full">
            {/* Google Sign Up */}
            <Button
                className="relative w-full"
                disabled={isLoading}
                onClick={handleGoogleSignUp}
                size="lg"
                type="button"
                variant="outline"
            >
                <GoogleIcon />
                Continue with Google
                {lastLoginMethod === "google" && (
                    <Badge
                        className="-top-1.5 -right-2 absolute rounded-none text-xs"
                        size="sm"
                        variant="primary"
                    >
                        Last used
                    </Badge>
                )}
            </Button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-muted-foreground text-xs">OR</span>
                <Separator className="flex-1" />
            </div>

            {/* Form */}
            <form
                className="flex flex-col gap-5"
                onSubmit={handleSubmit(onSubmit)}
            >
                <FormInput
                    aria-invalid={!!errors.fullName}
                    control={control}
                    label="Full Name"
                    name="fullName"
                    placeholder="John Doe"
                    type="text"
                />

                <FormInput
                    aria-invalid={!!errors.email}
                    control={control}
                    label="Email"
                    name="email"
                    placeholder="your@email.com"
                    type="email"
                />

                <div>
                    <FormInput
                        control={control}
                        label="Password"
                        name="password"
                        placeholder="Your secure password"
                        type="password"
                    />
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                        Your password must be at least 8 characters long and
                        contain at least 1 uppercase letter and 1 number.
                    </p>
                </div>

                {/* Global error message */}
                {error && (
                    <div className="flex items-center gap-3 border border-destructive bg-destructive/40 p-4">
                        <RiAlertLine className="mt-0.5 size-5 shrink-0 text-white" />
                        <p className="text-sm text-white">{error}</p>
                    </div>
                )}

                {/* Sign up button */}
                <Button
                    className="mt-8 w-full"
                    disabled={isSubmitting || isLoading}
                    size="lg"
                    type="submit"
                >
                    {isSubmitting || isLoading ? (
                        <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current/20 border-t-current" />
                            Creating your account...
                        </>
                    ) : (
                        <>Continue</>
                    )}
                </Button>

                {/* Sign in link */}
                <div className="text-center">
                    <p className="text-muted-foreground text-sm">
                        Already have an account?{" "}
                        <Link
                            className="font-medium text-primary transition-colors hover:text-gray-300"
                            href={PAGES.SIGN_IN}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
