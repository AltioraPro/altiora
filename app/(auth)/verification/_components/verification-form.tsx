"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiMailCheckFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import sendVerificationOtp from "@/app/(auth)/_lib/send-verification-otp";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PAGES } from "@/constants/pages";
import {
    type VerifyEmailFormValues,
    verifyEmailSchema,
} from "@/lib/auth/validators";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { emailParsers } from "../search-params";

export function VerificationForm() {
    const [{ email, otp }] = useQueryStates(emailParsers);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [resendingStatus, setResendingStatus] = useState<
        "idle" | "loading" | number
    >("idle");

    const { handleSubmit, formState, setValue, watch, setError } = useForm({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: {
            otp: "",
        },
    });

    const onSubmit = useCallback(
        (values: VerifyEmailFormValues) => {
            setIsLoading(true);

            authClient.signIn.emailOtp(
                {
                    email,
                    otp: values.otp,
                },
                {
                    onError: (ctx) => {
                        switch (ctx.error.code) {
                            case AUTH_ERRORS.INVALID_OTP:
                                setError("otp", {
                                    message: "Invalid code",
                                });
                                break;
                            default:
                                setError("root.resend", {
                                    message:
                                        ctx.error.message || "Unknown error",
                                });
                                break;
                        }
                        setIsLoading(false);
                    },
                    onSuccess: () => {
                        router.push(PAGES.DASHBOARD);
                    },
                }
            );
        },
        [email, router, setError]
    );

    const handleResendCode = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setResendingStatus("loading");

            sendVerificationOtp(email)
                .then((redirectUrl) => {
                    router.push(redirectUrl);
                })
                .catch(() => {
                    setError("root.resend", {
                        message: "Unknown error",
                    });
                })
                .finally(() => {
                    setResendingStatus(60);
                });
        },
        [email, router, setError]
    );

    useEffect(() => {
        if (otp) {
            setValue("otp", otp);
            handleSubmit(onSubmit)();
        }
    }, [otp, setValue, handleSubmit, onSubmit]);

    useEffect(() => {
        if (typeof resendingStatus === "number") {
            const interval = setInterval(() => {
                setResendingStatus((prev) => {
                    const p = prev as number;
                    return p > 0 ? p - 1 : "idle";
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [resendingStatus]);

    return (
        <form
            className="flex w-full flex-col gap-6 p-5 md:p-8"
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="flex flex-col items-center gap-2">
                {/* icon */}
                <div
                    className={cn(
                        "relative flex size-[68px] shrink-0 items-center justify-center lg:size-24"
                    )}
                >
                    <div className="relative z-10 flex size-12 items-center justify-center bg-neutral-900 ring-1 ring-neutral-800 ring-inset lg:size-16">
                        <RiMailCheckFill className="size-6 text-text-sub-600 lg:size-8" />
                    </div>
                </div>

                <div className="space-y-1 text-center">
                    <div className="mb-2 font-semibold text-2xl">
                        Verify your email
                    </div>
                    <div className="text-neutral-400 text-sm">
                        We sent a verification code to your email{" "}
                        <span className="font-medium text-neutral-50">
                            {email}
                        </span>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="flex w-full justify-center">
                <InputOTP
                    className="w-full"
                    maxLength={6}
                    onChange={(value) => {
                        setValue("otp", value);
                        if (value.length === 6) {
                            handleSubmit(onSubmit)();
                        }
                    }}
                    value={watch("otp")}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            </div>

            {formState.errors.otp?.message && (
                <p className="text-center text-destructive text-sm">
                    {formState.errors.otp?.message}
                </p>
            )}

            <div className="flex flex-col gap-2">
                <Button disabled={isLoading} type="submit" variant="primary">
                    {isLoading ? (
                        <>
                            <StaggeredFadeLoader variant="muted" />
                            Verifying...
                        </>
                    ) : (
                        "Submit Code"
                    )}
                </Button>
                <Button
                    className={cn(
                        resendingStatus !== "idle" && "pointer-events-none"
                    )}
                    disabled={resendingStatus !== "idle"}
                    onClick={handleResendCode}
                    size="md"
                    type="button"
                    variant="outline"
                >
                    {resendingStatus === "loading" ? (
                        "Resending..."
                    ) : (
                        <>
                            Resend Code{" "}
                            {typeof resendingStatus === "number" &&
                                `(${resendingStatus}s)`}
                        </>
                    )}
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

            {formState.errors.root?.resend?.message && (
                <p className="text-center text-destructive text-sm">
                    {formState.errors.root?.resend?.message}
                </p>
            )}
        </form>
    );
}
