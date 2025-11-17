"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiArrowRightLine, RiCheckboxCircleLine } from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { StaggeredFadeLoader } from "@/components/staggered-fade-loader";
import { BorderGradient } from "@/components/ui/border-gradient";
import { Button, ButtonArrow } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { authClient } from "@/lib/auth-client";
import { cn, getNameFromEmail } from "@/lib/utils";
import {
    type WaitlistInput,
    waitlistSchema,
} from "@/server/routers/auth/validators";

type SuccessState = {
    name: string;
    email: string;
};

export function WaitlistForm() {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState<SuccessState | null>(null);

    const { register, handleSubmit, reset } = useForm({
        resolver: zodResolver(waitlistSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: WaitlistInput) {
        setIsLoading(true);

        try {
            // Call the waitlist join endpoint
            const response = await authClient.waitlist.join({
                email: values.email,
            });

            if (response.error) {
                switch (response.error.code) {
                    case AUTH_ERRORS.WAITLIST_DISABLED:
                        addToast({
                            type: "error",
                            title: "Error",
                            message: "Waitlist is disabled",
                        });
                        break;
                    case AUTH_ERRORS.EMAIL_ALREADY_EXISTS:
                        addToast({
                            type: "error",
                            title: "Error",
                            message: "Email already exists",
                        });
                        break;
                    case AUTH_ERRORS.EMAIL_REQUIRED:
                        // Use a relevant existing translation key
                        addToast({
                            type: "error",
                            title: "Error",
                            message: "Email is required",
                        });
                        break;
                    default:
                        // Use the server's error message
                        addToast({
                            type: "error",
                            title: "Error",
                            message: response.error.message || "",
                        });
                }
                setIsLoading(false);
                return;
            }
            reset();

            setIsLoading(false);
            setSuccess({
                name: getNameFromEmail(values.email),
                email: values.email,
            });
        } catch {
            addToast({
                type: "error",
                title: "Error",
                message: "An unexpected error occurred",
            });
            setIsLoading(false);
        }
    }

    const showDefaultState = !(isLoading || success);

    return (
        <form
            className="flex w-full items-center justify-center"
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="mt-12 w-full max-w-md">
                <BorderGradient
                    className={cn(
                        "flex w-full items-center p-0 pr-2 opacity-70",
                        success && "px-2"
                    )}
                    containerClassName="w-full overflow-hidden rounded-none"
                >
                    <Input
                        {...register("email")}
                        autoComplete="off"
                        autoFocus
                        className={cn(
                            "w-full rounded-none border-none py-7 pl-6 text-base focus-visible:border-none focus-visible:outline-none focus-visible:ring-0",
                            success && "invisible mr-0 w-0 px-0"
                        )}
                        placeholder="Enter your email"
                    />

                    <Button
                        asChild
                        className={cn(
                            "rounded-none",
                            success &&
                                "w-full justify-center disabled:opacity-100"
                        )}
                        disabled={isLoading || !!success}
                        size="lg"
                        type="submit"
                        variant="primary"
                    >
                        <motion.button layout>
                            <AnimatePresence mode="popLayout">
                                {success && (
                                    <motion.span
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            filter: "blur(0px)",
                                        }}
                                        className="flex w-full items-center justify-center gap-2"
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                            filter: "blur(4px)",
                                        }}
                                        key="success"
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.4,
                                        }}
                                    >
                                        <RiCheckboxCircleLine className="size-5" />
                                        <span className="truncate">
                                            You're on the waitlist,{" "}
                                            <span className="font-bold">
                                                {success.name}{" "}
                                            </span>
                                            !
                                        </span>
                                    </motion.span>
                                )}
                                {isLoading && (
                                    <motion.span
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            filter: "blur(0px)",
                                        }}
                                        className="flex items-center gap-2"
                                        // exit={{
                                        //     opacity: 0,
                                        //     y: -10,
                                        //     filter: "blur(4px)",
                                        //     transition: { duration: 0.2 },
                                        // }}
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                            filter: "blur(4px)",
                                        }}
                                        key="loading"
                                    >
                                        <StaggeredFadeLoader
                                            size="large"
                                            variant="light"
                                        />{" "}
                                        Sending
                                    </motion.span>
                                )}
                                {showDefaultState && (
                                    <motion.span
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2"
                                        exit={{
                                            opacity: 0,
                                            y: -10,
                                            filter: "blur(4px)",
                                            transition: { duration: 0.2 },
                                        }}
                                        initial={{ opacity: 1, y: 0 }}
                                        key="join"
                                    >
                                        Join Waitlist{" "}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {showDefaultState && (
                                <ButtonArrow icon={RiArrowRightLine} />
                            )}
                        </motion.button>
                    </Button>
                </BorderGradient>
            </div>
        </form>
    );
}
