"use client";

import { RiCheckboxLine, RiFocus3Line, RiTargetLine } from "@remixicon/react";
import { motion } from "motion/react";
import { PAGES } from "@/constants/pages";
import * as CardLarge from "./card-large";
import { Section } from "./section";

interface ProductivitySectionProps {
    id?: string;
}

const notifications = [
    {
        icon: RiCheckboxLine,
        title: "Complete your habits",
        subtitle: "3 habits left today · 🔥 12 day streak",
    },
    {
        icon: RiFocus3Line,
        title: "Start a deep work session",
        subtitle: "2h 30m focused today · Beat your record!",
    },
    {
        icon: RiTargetLine,
        title: "You're 75% to your goal!",
        subtitle: "Keep pushing · 7 days left this quarter",
    },
];

export function ProductivitySection({ id }: ProductivitySectionProps) {
    return (
        <Section className="mt-0" id={id}>
            <CardLarge.Root className="mt-0" contentPosition="right">
                <CardLarge.Text
                    description="Track your deepwork sessions, set your goals and your habits, follow your progress and get insights on your productivity."
                    linkHref={PAGES.SIGN_UP}
                    linkText="Get started"
                    title="Altiora for productivity"
                />
                <CardLarge.Content
                    motionProps={{
                        initial: "hidden",
                        variants: {
                            hidden: {},
                            visible: {
                                transition: { staggerChildren: 0.15 },
                            },
                        },
                        viewport: { once: true, margin: "-300px" },
                        whileInView: "visible",
                    }}
                >
                    {notifications.map((notification) => (
                        <motion.div
                            className="flex w-full max-w-sm items-center gap-3 bg-neutral-900/80 px-4 py-3"
                            key={notification.title}
                            variants={{
                                hidden: {
                                    opacity: 0,
                                    x: 60,
                                    filter: "blur(8px)",
                                },
                                visible: {
                                    opacity: 1,
                                    x: 0,
                                    filter: "blur(0px)",
                                    transition: {
                                        type: "tween",
                                    },
                                },
                            }}
                        >
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-800">
                                <notification.icon className="size-5 text-neutral-400" />
                            </div>
                            <div className="flex flex-1 flex-col">
                                <span className="font-medium text-sm">
                                    {notification.title}
                                </span>
                                <span className="text-neutral-500 text-xs">
                                    {notification.subtitle}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </CardLarge.Content>
            </CardLarge.Root>
        </Section>
    );
}
