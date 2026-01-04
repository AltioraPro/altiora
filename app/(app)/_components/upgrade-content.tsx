"use client";

import { RiVipCrownLine } from "@remixicon/react";
import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { PROJECT } from "@/constants/project";
import { authClient } from "@/lib/auth-client";

type UpgradeContentProps = {
    userName: string | null;
};

export function UpgradeContent({ userName }: UpgradeContentProps) {
    const [isPending, setIsPending] = useState(false);
    const { addToast } = useToast();

    const handleSubscribe = async () => {
        setIsPending(true);

        const { error } = await authClient.subscription.upgrade({
            plan: "pro",
            successUrl: "/dashboard?subscription=success",
            cancelUrl: "/dashboard?subscription=canceled",
        });

        if (error) {
            addToast({
                type: "error",
                title: "Error",
                message: error.message,
            });
        }

        setIsPending(false);
    };

    return (
        <div className="md:-ml-8 flex min-h-[calc(100vh-200px)] items-center justify-center md:py-12">
            <div className="w-full max-w-[500px] p-6">
                <div className="mb-6 md:mt-6">
                    <h1 className="mb-2 font-semibold text-xl leading-none tracking-tight">
                        Unlock full access to {PROJECT.NAME}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {userName ? `Hi ${userName}, ` : ""}Your trial has ended
                        or your subscription has expired—choose a plan to
                        continue using all of {PROJECT.NAME}'s features.
                    </p>
                </div>

                {/* Pricing Card */}
                <div className="relative flex flex-col border border-neutral-800 bg-background p-6">
                    <div className="absolute top-6 right-4 flex items-center gap-1 rounded-full border px-2 py-1 font-mono font-normal text-[#878787] text-[9px]">
                        <RiVipCrownLine className="size-3" />
                        Altioran
                    </div>
                    <h2 className="mb-2 text-left text-lg">Everything</h2>
                    <div className="mt-1 flex items-baseline">
                        <span className="font-medium text-[32px] text-neutral-400 tracking-tight line-through">
                            €19
                        </span>

                        <span className="ml-1 font-medium text-[32px] tracking-tight">
                            €9
                        </span>

                        <span className="ml-1 font-medium text-lg">/mo</span>
                        <span className="ml-2 text-muted-foreground text-xs">
                            Excl. VAT
                        </span>
                    </div>
                    <p className="mt-3 text-left text-neutral-400 text-sm">
                        One plan, all features. No limits, no restrictions.
                        Everything you need to succeed.
                    </p>

                    <div className="mt-6">
                        <h3 className="text-left font-medium font-mono text-neutral-400 text-xs uppercase tracking-wide">
                            ALL FEATURES INCLUDED
                        </h3>
                        <ul className="mt-3 space-y-2">
                            <li className="flex items-start">
                                <Check className="mr-2 h-4 w-4 shrink-0 text-primary" />
                                <span className="text-sm">
                                    Unlimited trades
                                </span>
                            </li>
                            <li className="flex items-start">
                                <Check className="mr-2 h-4 w-4 shrink-0 text-primary" />
                                <span className="text-sm">
                                    Advanced analytics
                                </span>
                            </li>
                            <li className="flex items-start">
                                <Check className="mr-2 h-4 w-4 shrink-0 text-primary" />
                                <span className="text-sm">
                                    Unlimited habits
                                </span>
                            </li>
                            <li className="flex items-start">
                                <Check className="mr-2 h-4 w-4 shrink-0 text-primary" />
                                <span className="text-sm">Goal tracking</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="mr-2 h-4 w-4 shrink-0 text-primary" />
                                <span className="text-sm">
                                    Discord integration
                                </span>
                            </li>
                            <li className="flex items-start">
                                <Check className="mr-2 h-4 w-4 shrink-0 text-primary" />
                                <span className="text-sm">
                                    Leaderboard access
                                </span>
                            </li>
                            <li className="flex items-start">
                                <Check className="mr-2 h-4 w-4 shrink-0 text-primary" />
                                <span className="text-sm">
                                    Priority support
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-6 border-border border-t pt-6">
                        <Button
                            className="h-12 w-full"
                            disabled={isPending}
                            onClick={handleSubscribe}
                        >
                            {isPending ? "Redirecting..." : "Subscribe Now"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
