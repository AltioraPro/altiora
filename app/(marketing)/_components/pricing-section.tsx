"use client";

import { PricingCard } from "@/components/pricing-card";
import { PRICING_PLANS } from "@/constants/pricing";
import { Section } from "./section";

interface PricingSectionProps {
    id?: string;
}

export function PricingSection({ id }: PricingSectionProps) {
    return (
        <Section id={id}>
            <div className="relative flex flex-col items-center text-center">
                <h2 className="mb-4 text-center font-medium text-2xl sm:text-3xl">
                    Choose Your Level of Support
                </h2>
                <p className="mb-8 max-w-2xl text-md text-muted-foreground">
                    The complete tool to drive your performance, or personalized
                    mentoring to go even further.
                </p>

                <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                    {PRICING_PLANS.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            variant={
                                plan.id === "performance"
                                    ? "highlighted"
                                    : "default"
                            }
                            buttonVariant={
                                plan.id === "performance"
                                    ? "primary"
                                    : "outline"
                            }
                        />
                    ))}
                </div>
            </div>
        </Section>
    );
}
