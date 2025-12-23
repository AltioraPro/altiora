"use client";

import type { ReactNode } from "react";
import {
    BestValueIllustration,
    CentralizedToolsIllustration,
    ModernInterfaceIllustration,
} from "./feature-illustrations";
import { Section } from "./section";

interface AdvantagesSectionProps {
    id?: string;
}

interface Feature {
    title: string;
    description: string;
    illustration: ReactNode;
}

const features: Feature[] = [
    {
        title: "Centralized Tools",
        description:
            "Everything you need in one place. Trading journal, habits, and goals all together.",
        illustration: <CentralizedToolsIllustration />,
    },
    {
        title: "Modern and Responsive Interface",
        description:
            "Modern design, smooth usage. Altiora makes your tools pleasant to use.",
        illustration: <ModernInterfaceIllustration />,
    },
    {
        title: "Best Value for Money",
        description:
            "No add-ons, no hidden fees. A fair price for all features.",
        illustration: <BestValueIllustration />,
    },
];

export function AdvantagesSection({ id }: AdvantagesSectionProps) {
    return (
        <Section id={id}>
            <h2 className="flex flex-col font-normal text-2xl sm:text-3xl">
                <span>Why Altiora ?</span>
                <span className="text-neutral-400">
                    It's the modern platform for traders.
                </span>
            </h2>
            <div className="mx-auto w-full max-w-7xl">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            className="flex flex-1 flex-col justify-between gap-4 bg-neutral-900 p-4"
                            key={feature.title}
                        >
                            <div>
                                <h3 className="font-medium">{feature.title}</h3>
                                <p className="text-neutral-400">
                                    {feature.description}
                                </p>
                            </div>
                            <figure className="relative mt-2 flex h-[378px] w-full items-center justify-center overflow-hidden bg-neutral-800">
                                {feature.illustration}
                            </figure>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
}
