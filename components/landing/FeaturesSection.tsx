"use client";

import { ArrowRight, BookOpen, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import ShinyText from "@/components/landing/ShinyText";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import SpotlightCard from "../SpotlightCard";

// Discord Icon SVG Component
const DiscordIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

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

            <div className="absolute top-1/3 left-0 h-px w-24 bg-gradient-to-r from-transparent to-white/20" />
            <div className="absolute top-2/3 right-0 h-px w-32 bg-gradient-to-l from-transparent to-white/25" />

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
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/30" />
                    <span className="text-white/60 text-xs tracking-[0.3em]">
                        FEATURES
                    </span>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/30" />
                </div>

                <h2 className="mb-6 font-argesta font-bold text-5xl md:text-6xl">
                    <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
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
                                <BookOpen className="h-8 w-8 text-white/80 transition-colors duration-300 group-hover:text-white" />
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
                                <Zap className="h-8 w-8 text-white/80 transition-colors duration-300 group-hover:text-white" />
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
                                <Trophy className="h-8 w-8 text-white/80 transition-colors duration-300 group-hover:text-white" />
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
                                <DiscordIcon className="h-8 w-8 text-white/80 transition-colors duration-300 group-hover:text-white" />
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
                                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
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
