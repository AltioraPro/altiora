"use client";

import {
    RiArrowRightLine,
    RiBookOpenLine,
    RiDiscordLine,
    RiLightbulbFlashLine,
    RiTrophyLine,
} from "@remixicon/react";
import Link from "next/link";
import ShinyText from "@/components/landing/ShinyText";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import SpotlightCard from "../SpotlightCard";

export const FeaturesSection = () => (
    <section
        className="relative min-h-screen overflow-hidden text-pure-white"
        style={{
            background: "linear-gradient(220.55deg, #000000 0%, #0a0a0a 100%)",
        }}
    >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="absolute top-20 left-10 h-5 w-5 rotate-45 animate-pulse border border-white/10" />
            <div
                className="absolute top-40 right-20 h-8 w-8 rotate-12 animate-bounce border border-white/15"
                style={{ animationDuration: "3s" }}
            />
            <div className="absolute bottom-32 left-1/3 h-6 w-6 rotate-45 border border-white/20" />
            <div
                className="absolute right-1/4 bottom-60 h-4 w-4 animate-pulse rounded-full bg-white/5"
                style={{ animationDelay: "1s" }}
            />

            <div className="absolute top-1/3 left-0 h-px w-24 bg-linear-to-r from-transparent to-white/20" />
            <div className="absolute top-2/3 right-0 h-px w-32 bg-linear-to-l from-transparent to-white/25" />

            <div
                className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 h-[60%] w-[80%] transform opacity-20"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 70%)",
                }}
            />
        </div>

        <div className="container relative z-10 mx-auto px-6 py-20">
            <div className="mb-20 text-center">
                <div className="mb-6 flex items-center justify-center space-x-4">
                    <div className="h-px w-16 bg-linear-to-r from-transparent to-white/30" />
                    <span className="text-white/60 text-xs tracking-[0.3em]">
                        FEATURES
                    </span>
                    <div className="h-px w-16 bg-linear-to-l from-transparent to-white/30" />
                </div>

                <h2 className="mb-6 font-argesta font-bold text-5xl md:text-6xl">
                    <span className="bg-linear-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        TRANSFORM
                    </span>
                    <br />
                    <ShinyText
                        className="font-argesta font-bold text-5xl md:text-6xl"
                        speed={6}
                        text="YOUR MINDSET"
                    />
                </h2>

                <AnimatedText
                    charDelay={30}
                    className="mx-auto max-w-2xl text-lg text-white/70 md:text-xl"
                    delay={200}
                    text="A complete platform to develop your personal and professional discipline"
                />
            </div>

            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                <AnimatedCard delay={0}>
                    <SpotlightCard
                        className="custom-spotlight-card group relative h-[400px] bg-pure-black"
                        spotlightColor="rgba(255, 255, 255, 0.2)"
                    >
                        <div className="relative mb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 transition-colors duration-300 group-hover:bg-white/10">
                                <RiBookOpenLine className="size-8 text-white/80 transition-colors duration-300 group-hover:text-white" />
                            </div>

                            <div className="-top-2 -right-2 absolute h-3 w-3 rounded-full bg-white/20 opacity-0 group-hover:animate-ping group-hover:opacity-100" />
                        </div>

                        <h3 className="mb-4 font-bold text-white text-xl">
                            TRADING JOURNAL
                        </h3>

                        <p className="mb-6 text-sm text-white/60 leading-relaxed">
                            Analyze your trades, identify patterns and optimize
                            your strategy with an intelligent journal.
                        </p>

                        <ul className="space-y-2 text-white/50 text-xs">
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Emotional analysis</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Advanced metrics</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Detailed reports</span>
                            </li>
                        </ul>
                    </SpotlightCard>
                </AnimatedCard>

                <AnimatedCard delay={150}>
                    <SpotlightCard
                        className="custom-spotlight-card group relative h-[400px] bg-pure-black"
                        spotlightColor="rgba(255, 255, 255, 0.2)"
                    >
                        <div className="relative mb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 transition-colors duration-300 group-hover:bg-white/10">
                                <RiLightbulbFlashLine className="size-8 text-white/80 transition-colors duration-300 group-hover:text-white" />
                            </div>
                            <div className="-top-2 -right-2 absolute h-3 w-3 rounded-full bg-white/20 opacity-0 group-hover:animate-ping group-hover:opacity-100" />
                        </div>

                        <h3 className="mb-4 font-bold text-white text-xl">
                            HABIT TRACKER
                        </h3>

                        <p className="mb-6 text-sm text-white/60 leading-relaxed">
                            Build lasting habits with a visual and motivating
                            tracking system.
                        </p>

                        <ul className="space-y-2 text-white/50 text-xs">
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Visual calendar</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Streaks & stats</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Smart reminders</span>
                            </li>
                        </ul>
                    </SpotlightCard>
                </AnimatedCard>

                <AnimatedCard delay={300}>
                    <SpotlightCard
                        className="custom-spotlight-card group relative h-[400px] bg-pure-black"
                        spotlightColor="rgba(255, 255, 255, 0.2)"
                    >
                        <div className="relative mb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 transition-colors duration-300 group-hover:bg-white/10">
                                <RiTrophyLine className="size-8 text-white/80 transition-colors duration-300 group-hover:text-white" />
                            </div>
                            <div className="-top-2 -right-2 absolute h-3 w-3 rounded-full bg-white/20 opacity-0 group-hover:animate-ping group-hover:opacity-100" />
                        </div>

                        <h3 className="mb-4 font-bold text-white text-xl">
                            GOAL PLANNING
                        </h3>

                        <p className="mb-6 text-sm text-white/60 leading-relaxed">
                            Plan and achieve your goals with a structured and
                            measurable approach.
                        </p>

                        <ul className="space-y-2 text-white/50 text-xs">
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Smart OKRs</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Progress tracking</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Step breakdown</span>
                            </li>
                        </ul>
                    </SpotlightCard>
                </AnimatedCard>

                <AnimatedCard delay={450}>
                    <SpotlightCard
                        className="custom-spotlight-card group relative h-[400px] bg-pure-black"
                        spotlightColor="rgba(255, 255, 255, 0.2)"
                    >
                        <div className="relative mb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 transition-colors duration-300 group-hover:bg-white/10">
                                <RiDiscordLine className="size-8 text-white/80 transition-colors duration-300 group-hover:text-white" />
                            </div>
                            <div className="-top-2 -right-2 absolute h-3 w-3 rounded-full bg-white/20 opacity-0 group-hover:animate-ping group-hover:opacity-100" />
                        </div>

                        <h3 className="mb-4 font-bold text-white text-xl">
                            DISCORD POMODORO
                        </h3>

                        <p className="mb-6 text-sm text-white/60 leading-relaxed">
                            Boost your productivity with our Discord bot that
                            syncs your pomodoro sessions directly to your
                            workspace.
                        </p>

                        <ul className="space-y-2 text-white/50 text-xs">
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Pomodoro timer bot</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Auto session tracking</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Community accountability</span>
                            </li>
                        </ul>
                    </SpotlightCard>
                </AnimatedCard>
            </div>

            <AnimatedCard delay={500}>
                <div className="mt-16 mb-8 text-center">
                    <p className="text-sm text-white/50 tracking-[0.2em]">
                        AND MUCH MORE...
                    </p>

                    <div className="mt-6 flex items-center justify-center space-x-6 text-white/30 text-xs">
                        <span>Analytics Dashboard</span>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <span>Smart Notifications</span>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <span>Export Features</span>
                    </div>
                </div>
            </AnimatedCard>

            <AnimatedCard delay={550}>
                <div className="mt-20 text-center">
                    <div className="inline-flex flex-col items-center space-y-6">
                        <p className="text-sm text-white/60 tracking-widest">
                            READY TO TRANSFORM YOUR DISCIPLINE?
                        </p>

                        <Link href="/pricing">
                            <HoverBorderGradient
                                className="border border-white/10 bg-pure-black px-8 py-4 text-white"
                                containerClassName="bg-pure-black"
                            >
                                <span className="flex items-center gap-3 tracking-widest">
                                    START NOW
                                    <RiArrowRightLine className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </HoverBorderGradient>
                        </Link>

                        <div className="mt-8 flex items-center space-x-8 text-white/40 text-xs">
                            <div className="text-center">
                                <div className="text-white/60">1000+</div>
                                <div>Active users</div>
                            </div>
                            <div className="h-8 w-px bg-white/20" />
                            <div className="text-center">
                                <div className="text-white/60">50K+</div>
                                <div>Trades analyzed</div>
                            </div>
                            <div className="h-8 w-px bg-white/20" />
                            <div className="text-center">
                                <div className="text-white/60">95%</div>
                                <div>Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedCard>
        </div>
    </section>
);
