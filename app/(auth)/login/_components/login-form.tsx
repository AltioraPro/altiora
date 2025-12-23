"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiAlertLine, RiCheckboxCircleFill } from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import sendVerificationOtp from "@/app/(auth)/_lib/send-verification-otp";
import { FormInput } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth-client";
import { withQuery } from "@/lib/utils/routes";
import { messageParsers } from "../search-params";

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

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const [{ message, error: errorQuery }] = useQueryStates(messageParsers);

    const lastLoginMethod = useMemo(
        () => authClient.getLastUsedLoginMethod(),
        []
    );

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(errorQuery);
    const [rememberMe, setRememberMe] = useState(false);

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        control,
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = (values: LoginFormValues) => {
        setError(null);
        setIsLoading(true);

        authClient.signIn.email(
            {
                email: values.email,
                password: values.password,
                callbackURL: PAGES.DASHBOARD,
                rememberMe,
            },
            {
                onError: (ctx) => {
                    if (ctx.error.code === AUTH_ERRORS.EMAIL_NOT_VERIFIED) {
                        sendVerificationOtp(values.email)
                            .then((redirectUrl) => {
                                router.push(redirectUrl);
                            })
                            .catch((signInError) => {
                                setError(signInError as string);
                            })
                            .finally(() => {
                                setIsLoading(false);
                            });
                    } else if (
                        ctx.error.code === AUTH_ERRORS.INVALID_EMAIL_OR_PASSWORD
                    ) {
                        setIsLoading(false);
                        setError("Invalid email or password");
                    } else {
                        setIsLoading(false);
                        setError(ctx.error.message);
                    }
                },
            }
        );
    };

    const handleGoogleSignIn = () => {
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
            {/* Google Sign In */}
            <Button
                className="relative w-full"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
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
                    aria-invalid={!!errors.email}
                    control={control}
                    label="Email"
                    name="email"
                    placeholder="your@email.com"
                    type="email"
                />

                <FormInput
                    aria-invalid={!!errors.password}
                    control={control}
                    label="Password"
                    name="password"
                    placeholder="Your password"
                    type="password"
                />

                {/* Options */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={rememberMe}
                            id="rememberMe"
                            onCheckedChange={(checked) =>
                                setRememberMe(checked === true)
                            }
                        />
                        <Label
                            className="cursor-pointer text-muted-foreground text-sm"
                            htmlFor="rememberMe"
                        >
                            Remember me
                        </Label>
                    </div>

                    <Link
                        className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                        href={PAGES.FORGOT_PASSWORD}
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Global error message */}
                {error && (
                    <div className="flex items-center gap-3 border border-destructive bg-destructive/40 p-4">
                        <RiAlertLine className="mt-0.5 size-5 shrink-0 text-white" />
                        <p className="text-sm text-white">{error}</p>
                    </div>
                )}

                {/* Success message */}
                {message && (
                    <div className="flex items-center gap-3 border border-green-500/20 bg-green-500/10 p-4">
                        <RiCheckboxCircleFill className="size-5 shrink-0 text-green-400" />
                        <p className="text-green-400 text-sm">{message}</p>
                    </div>
                )}

                {/* Sign in button */}
                <Button
                    className="mt-8 w-full"
                    disabled={isSubmitting || isLoading}
                    size="lg"
                    type="submit"
                >
                    {isSubmitting || isLoading ? (
                        <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current/20 border-t-current" />
                            Signing in...
                        </>
                    ) : (
                        <>Continue</>
                    )}
                </Button>

                {/* Sign up link */}
                <div className="text-center">
                    <p className="text-muted-foreground text-sm">
                        Don&apos;t have an account?{" "}
                        <Link
                            className="font-medium text-primary transition-colors hover:text-gray-300"
                            href={PAGES.SIGN_UP}
                        >
                            Create account
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
