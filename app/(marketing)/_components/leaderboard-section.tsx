"use client";

import { Logo } from "@/components/logo";
import { PAGES } from "@/constants/pages";
import { cn } from "@/lib/utils";
import { RiDiscordFill, RiLinksLine } from "@remixicon/react";
import { motion } from "motion/react";
import Image from "next/image";
import * as CardLarge from "./card-large";
import { Section } from "./section";

interface LeaderboardSectionProps {
    id?: string;
}

const leaderboardEntries = [
    {
        rank: 1,
        name: "Hugo",
        image: "https://lh3.googleusercontent.com/a/ACg8ocLWIWGEkhMLPKJug38ZUHOf_nO7ZXnTslGAdRA0AH3xCCwcBeuZ=s96-c",
        totalTime: "12h 40m",
    },
    {
        rank: 2,
        name: "Noa",
        image: "https://github.com/17sx.png",
        totalTime: "11h 15m",
    },
    {
        rank: 3,
        name: "Mattéo",
        image: "https://github.com/drixares.png",
        totalTime: "10h 05m",
    },
] as const;

export function LeaderboardSection({ id }: LeaderboardSectionProps) {
    return (
        <Section className="mt-0" id={id}>
            <CardLarge.Root className="mt-0" contentPosition="left">
                <CardLarge.Content
                    motionProps={{
                        initial: "hidden",
                        variants: {
                            hidden: {},
                            visible: {
                                transition: { staggerChildren: 0.1 },
                            },
                        },
                        viewport: { once: true, margin: "-300px" },
                        whileInView: "visible",
                    }}
                >
                    <div className="flex items-center justify-center gap-4">
                        <div className="-translate-x-1 flex size-[72px] items-center justify-center">
                            <Logo className="h-6 w-fit sm:h-8" />
                        </div>
                        <div className="flex size-9 items-center justify-center rounded-full bg-neutral-800">
                            <RiLinksLine className="size-4 text-neutral-300 sm:size-5" />
                        </div>
                        <div className="flex size-[72px] items-center justify-center">
                            <RiDiscordFill className="h-6 w-fit sm:h-10" />
                        </div>
                    </div>
                    {leaderboardEntries.map((entry) => (
                        <motion.div
                            className="flex w-full max-w-sm items-center justify-between gap-3 bg-neutral-900/80 px-4 py-3"
                            key={entry.name}
                            variants={{
                                hidden: {
                                    opacity: 0,
                                    x: -60,
                                    filter: "blur(8px)",
                                },
                                visible: {
                                    opacity: 1,
                                    x: 0,
                                    filter: "blur(0px)",
                                    transition: { type: "tween" },
                                },
                            }}
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex w-5 shrink-0 items-center justify-center">
                                    <span className="font-medium text-neutral-500 text-sm">
                                        #{entry.rank}
                                    </span>
                                </div>
                                <div className="relative">
                                    {entry.rank === 1 && (
                                        <div className="absolute left-5 z-10 transform">
                                            <Image
                                                alt="Crown"
                                                className="drop-shadow-lg"
                                                height={70}
                                                src="/img/crown.png"
                                                width={70}
                                            />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800",
                                            entry.rank === 1 && "mt-2"
                                        )}
                                    >
                                        <img
                                            alt={entry.name}
                                            className="size-full object-cover"
                                            height={36}
                                            src={entry.image}
                                            width={36}
                                        />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <span className="truncate font-medium text-sm">
                                        {entry.name}
                                    </span>
                                </div>
                            </div>

                            <div className="shrink-0 text-right">
                                <span className="font-medium text-sm">
                                    {entry.totalTime}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </CardLarge.Content>

                <CardLarge.Text
                    description="Work with your friends to achieve your goals together. Enable deepwork sessions by linking your Discord account."
                    linkHref={PAGES.SIGN_UP}
                    linkText="Join the leaderboard"
                    title="Deep Work Leaderboard"
                />
            </CardLarge.Root>
        </Section>
    );
}
