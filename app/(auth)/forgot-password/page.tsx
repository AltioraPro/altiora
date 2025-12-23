"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    RiArrowLeftLine,
    RiCheckboxCircleFill,
    RiMailLine,
} from "@remixicon/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth-client";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setError,
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true);

        const { error } = await authClient.requestPasswordReset({
            email: data.email,
            redirectTo: PAGES.RESET_PASSWORD,
        });

        if (error) {
            setError("email", {
                message: error.message,
            });
            setIsLoading(false);
            return;
        }

        setIsSuccess(true);
        setIsLoading(false);
    };

    if (isSuccess) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="w-full max-w-[472px] px-4">
                    <div className="flex w-full flex-col gap-6 p-5 md:p-8">
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative flex size-[68px] shrink-0 items-center justify-center lg:size-24">
                                <div className="relative z-10 flex size-12 items-center justify-center bg-neutral-900 ring-1 ring-neutral-800 ring-inset lg:size-16">
                                    <RiCheckboxCircleFill className="size-6 text-text-sub-600 lg:size-8" />
                                </div>
                            </div>

                            <div className="space-y-1 text-center">
                                <div className="mb-2 font-semibold text-2xl">
                                    Check Your Email
                                </div>
                                <div className="text-neutral-400 text-sm">
                                    We sent a password reset link to{" "}
                                    <span className="font-medium text-neutral-50">
                                        {getValues("email")}
                                    </span>
                                </div>
                                <div className="text-neutral-400 text-sm">
                                    Click the link in the email to reset your
                                    password. The link will expire in 1 hour.
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={() => setIsSuccess(false)}
                                type="button"
                                variant="primary"
                            >
                                Send Another Email
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={PAGES.SIGN_IN}>
                                    <RiArrowLeftLine className="size-4" />
                                    Back to Login
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-col items-center gap-1 text-center text-neutral-400 text-sm">
                            Didn&apos;t receive the email? Check your spam
                            folder or{" "}
                            <button
                                className="text-primary hover:text-primary/90"
                                onClick={() => setIsSuccess(false)}
                                type="button"
                            >
                                try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                <RiMailLine className="size-6 text-text-sub-600 lg:size-8" />
                            </div>
                        </div>

                        <div className="space-y-1 text-center">
                            <div className="mb-2 font-semibold text-2xl">
                                Forgot Password
                            </div>
                            <div className="text-neutral-400 text-sm">
                                Enter your email address and we&apos;ll send you
                                a link to reset your password.
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-2">
                        <label
                            className="font-medium text-neutral-400 text-sm"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <Input
                            {...register("email")}
                            id="email"
                            placeholder="your@email.com"
                            type="email"
                        />
                        {errors.email && (
                            <p className="text-destructive text-sm">
                                {errors.email.message}
                            </p>
                        )}
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
                                    Sending...
                                </>
                            ) : (
                                "Send Reset Link"
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
