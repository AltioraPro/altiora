"use client";

import { RiCheckLine } from "@remixicon/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/constants/pages";
import { Section } from "./section";

const plans = [
    {
        name: "Pro",
        price: "$12",
        period: "/month",
        description: "For serious traders",
        features: [
            "Unlimited trades",
            "Advanced analytics",
            "Unlimited habits",
            "Goal tracking",
            "Discord integration",
            "Leaderboard access",
            "Priority support",
        ],
        cta: "Start Free Trial",
        highlighted: true,
    },
    {
        name: "Team",
        price: "$29",
        period: "/month",
        description: "For trading groups",
        features: [
            "Everything in Pro",
            "Up to 10 members",
            "Team leaderboards",
            "Group analytics",
            "Admin dashboard",
        ],
        cta: "Contact Us",
        highlighted: false,
    },
] as const;

interface PricingSectionProps {
    id?: string;
}

export function PricingSection({ id }: PricingSectionProps) {
    return (
        <Section id={id}>
            <div className="text-center">
                <h2 className="font-normal text-3xl">
                    Simple, transparent pricing
                </h2>
                <p className="mt-2 text-neutral-400">
                    Start free, upgrade when you're ready.
                </p>
            </div>

            <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
                {plans.map((plan) => (
                    <div
                        className={`flex flex-col justify-between gap-6 p-6 ${
                            plan.highlighted
                                ? "border border-neutral-700 bg-neutral-900"
                                : "bg-neutral-900/50"
                        }`}
                        key={plan.name}
                    >
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="font-medium text-2xl">
                                    {plan.price}
                                </span>
                                <span className="text-neutral-500 text-sm">
                                    {plan.period}
                                </span>
                            </div>
                            <h3 className="mt-2 font-medium text-lg">
                                {plan.name}
                            </h3>
                            <p className="text-neutral-500 text-sm">
                                {plan.description}
                            </p>

                            <ul className="mt-6 space-y-3">
                                {plan.features.map((feature) => (
                                    <li
                                        className="flex items-center gap-2 text-sm"
                                        key={feature}
                                    >
                                        <RiCheckLine className="size-4 shrink-0 text-neutral-400" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button
                            asChild
                            variant={plan.highlighted ? "primary" : "outline"}
                        >
                            <Link href={PAGES.SIGN_UP}>{plan.cta}</Link>
                        </Button>
                    </div>
                ))}
            </div>
        </Section>
    );
}
