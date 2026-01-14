"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/constants/pages";
import { Section } from "./section";

interface PricingSectionProps {
    id?: string;
}

export function PricingSection({ id }: PricingSectionProps) {
    return (
        <Section id={id}>
            <div className="relative flex flex-col items-center text-center">
                <h2 className="mb-4 text-center font-medium text-2xl sm:text-3xl">
                    One plan, everything included
                </h2>
                <p className="mb-8 max-w-2xl text-md text-muted-foreground">
                    No complicated tiers, no hidden limits. One plan gives you
                    access to everything. Simple and straightforward.
                </p>

                <div className="mt-8 grid w-full max-w-md grid-cols-1 gap-10">
                    {/* Pro Plan */}
                    <div className="relative flex flex-col border border-neutral-800 bg-background p-8">
                        <div className="absolute top-8 right-4 rounded-full border px-2 py-1 font-mono font-normal text-[#878787] text-[9px]">
                            Limited offer
                        </div>
                        <h2 className="mb-2 text-left text-xl">Everything</h2>
                        <div className="mt-1 flex items-baseline">
                            <span className="font-medium text-[40px] text-neutral-400 tracking-tight line-through">
                                €19
                            </span>

                            <span className="ml-1 font-medium text-[40px] tracking-tight">
                                €9
                            </span>

                            <span className="ml-1 font-medium text-xl">
                                /mo
                            </span>
                            <span className="ml-2 text-muted-foreground text-xs">
                                Excl. VAT
                            </span>
                        </div>
                        <p className="mt-4 text-left text-neutral-400 text-sm">
                            One plan, all features. No limits, no restrictions.
                            Everything you need to succeed.
                        </p>

                        <div className="mt-8">
                            <h3 className="text-left font-medium font-mono text-neutral-400 text-xs uppercase tracking-wide">
                                ALL FEATURES INCLUDED
                            </h3>
                            <ul className="mt-4 space-y-2">
                                <li className="flex items-start">
                                    <Check className="mr-2 h-5 w-5 shrink-0 text-primary" />
                                    <span className="text-sm">
                                        Unlimited trades
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="mr-2 h-5 w-5 shrink-0 text-primary" />
                                    <span className="text-sm">
                                        Advanced analytics
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="mr-2 h-5 w-5 shrink-0 text-primary" />
                                    <span className="text-sm">
                                        Unlimited habits
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="mr-2 h-5 w-5 shrink-0 text-primary" />
                                    <span className="text-sm">
                                        Goal tracking
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="mr-2 h-5 w-5 shrink-0 text-primary" />
                                    <span className="text-sm">
                                        Discord integration
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="mr-2 h-5 w-5 shrink-0 text-primary" />
                                    <span className="text-sm">
                                        Leaderboard access
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="mr-2 h-5 w-5 shrink-0 text-primary" />
                                    <span className="text-sm">
                                        Priority support
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-8 border-border border-t pt-8">
                            <Link href={PAGES.SIGN_UP}>
                                <Button className="h-12 w-full">
                                    Start 14 days trial
                                </Button>
                            </Link>
                        </div>
                        <p className="mt-4 font-mono text-muted-foreground text-xs">
                            (No credit card required)
                        </p>
                    </div>
                </div>
            </div>
        </Section>
    );
}
