"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { PricingPlan } from "@/constants/pricing";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

type PricingCardVariant = "default" | "highlighted";
type ButtonVariant = "primary" | "outline";

type PricingCardProps = {
    plan: PricingPlan;
    variant?: PricingCardVariant;
    buttonVariant?: ButtonVariant;
    footnoteOverride?: string;
    customAction?: ReactNode;
    className?: string;
};

export function PricingCard({
    plan,
    variant = "default",
    buttonVariant = "outline",
    footnoteOverride,
    customAction,
    className,
}: PricingCardProps) {
    const isHighlighted = variant === "highlighted";
    const footnote = footnoteOverride ?? plan.footnote;

    return (
        <div
            className={cn(
                "relative flex flex-col bg-background p-6",
                isHighlighted
                    ? "border border-neutral-300"
                    : "border border-neutral-800",
                className
            )}
        >
            {isHighlighted && plan.badge && (
                <div className="absolute -top-3 right-4 rounded-full border border-neutral-300 bg-background px-2.5 py-1 text-xs">
                    {plan.badge}
                </div>
            )}

            <div className="mb-4">
                <h2 className="mb-1 text-left text-base tracking-wide">
                    {plan.name}
                </h2>

                <p
                    className={cn(
                        "text-left text-muted-foreground text-sm mb-3"
                    )}
                >
                    {plan.description}
                </p>

                <div className="flex items-baseline">
                    <span className="text-2xl text-foreground tracking-tight">
                        {plan.price.amount}
                    </span>
                    {plan.price.period && (
                        <span className="ml-2 text-sm text-muted-foreground">
                            {plan.price.period}
                        </span>
                    )}
                </div>
            </div>

            <Separator />

            <ul className="py-6 space-y-2">
                {plan.features.map((feature) => (
                    <li
                        key={feature}
                        className="flex items-start text-left text-foreground"
                    >
                        <span className="size-5 shrink-0">•</span>
                        <span className="text-sm">{feature}</span>
                    </li>
                ))}
            </ul>

            <div className={cn("mt-auto pt-6")}>
                {customAction ?? (
                    <DefaultCtaButton plan={plan} variant={buttonVariant} />
                )}
                <p className="mt-4 text-center text-muted-foreground text-xs">
                    {footnote}
                </p>
            </div>
        </div>
    );
}

type DefaultCtaButtonProps = {
    plan: PricingPlan;
    variant: ButtonVariant;
};

function DefaultCtaButton({ plan, variant }: DefaultCtaButtonProps) {
    if (plan.cta.external) {
        return (
            <Button variant={variant} asChild className="w-full" size="lg">
                <a href={plan.cta.href} target="_blank" rel="noopener">
                    {plan.cta.label}
                </a>
            </Button>
        );
    }

    return (
        <Button variant={variant} asChild className="w-full" size="lg">
            <Link href={plan.cta.href}>{plan.cta.label}</Link>
        </Button>
    );
}
