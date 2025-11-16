import {
    RiCheckLine,
    RiLightbulbFlashLine,
    RiMessageLine,
    RiSparklingLine,
    RiVipCrownLine,
} from "@remixicon/react";
import Link from "next/link";
import { Header } from "@/components/header";
import ShinyText from "@/components/landing/ShinyText";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { PAGES } from "@/constants/pages";
import { ProButton } from "./_components/pro-button";

export default function PricingPage() {
    const testimonials1 = [
        {
            quote: "ALTIORA transformed my trading discipline completely. The habit tracking and journal insights are game-changers for my daily routine.",
            name: "Alex M.",
            title: "Professional Trader",
        },
        {
            quote: "Finally found a platform that understands the mental side of trading. The goal planning features keep me accountable every single day.",
            name: "Sarah K.",
            title: "Day Trader",
        },
        {
            quote: "The Discord integration for accountability is brilliant. My trading performance improved 300% since using ALTIORA consistently.",
            name: "Marcus R.",
            title: "Forex Trader",
        },
        {
            quote: "Clean interface, powerful analytics. ALTIORA helped me build the discipline I needed to become consistently profitable.",
            name: "Emma L.",
            title: "Swing Trader",
        },
        {
            quote: "The habit streaks and trading journal work perfectly together. I can finally track my progress and stay motivated long-term.",
            name: "David Chen",
            title: "Crypto Trader",
        },
    ];

    const testimonials2 = [
        {
            quote: "The Altioran plan gives me unlimited access to everything I need. No more worrying about limits or restrictions.",
            name: "Michael T.",
            title: "Altioran Member",
        },
        {
            quote: "Unlimited goals, unlimited habits, unlimited journal entries. This is exactly what I needed to scale my trading.",
            name: "Lisa P.",
            title: "Altioran Member",
        },
        {
            quote: "The private coaching session completely transformed my approach to life and trading. Worth every penny.",
            name: "Robert K.",
            title: "Private Coaching Client",
        },
        {
            quote: "Having unlimited access to all features has accelerated my growth beyond what I thought was possible.",
            name: "Jennifer W.",
            title: "Altioran Member",
        },
        {
            quote: "The private coaching helped me identify blind spots I never knew existed. Game-changing experience.",
            name: "Thomas B.",
            title: "Private Coaching Client",
        },
    ];

    return (
        <>
            <Header />

            <section className="min-h-screen bg-linear-to-br from-pure-black to-neutral-950 pt-20">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-16 text-center">
                        <h1 className="mb-6 font-argesta font-bold text-5xl text-white lg:text-6xl">
                            Choose Your Path.
                        </h1>
                        <ShinyText
                            className="mx-auto max-w-2xl text-neutral-400 text-xl"
                            speed={8}
                            text="Start your journey to discipline and success with our proven platform"
                        />
                    </div>

                    {/* Pricing Cards */}
                    <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Free Plan */}
                        <div className="relative rounded-2xl border border-neutral-700 bg-linear-to-br from-neutral-800/50 to-neutral-900/50 p-6 backdrop-blur-xs transition-all duration-300 hover:border-neutral-600">
                            <div className="absolute top-4 right-4">
                                <span className="rounded-full bg-white/10 px-3 py-1 font-medium text-gray-300 text-sm">
                                    Free
                                </span>
                            </div>

                            <div className="mb-6">
                                <h3 className="mb-2 font-bold text-white text-xl">
                                    Free Plan
                                </h3>
                                <p className="mb-4 text-gray-400">
                                    Start your transformation
                                </p>

                                <div className="mb-4 flex items-baseline">
                                    <span className="font-bold text-3xl text-white">
                                        €0
                                    </span>
                                    <span className="ml-2 text-neutral-400">
                                        / month
                                    </span>
                                </div>
                            </div>

                            <ul className="mb-6 space-y-3">
                                <li className="flex items-center text-neutral-300">
                                    <RiCheckLine className="mr-3 size-4 shrink-0 text-neutral-400" />
                                    <span>
                                        Trading journal (10 entries/month)
                                    </span>
                                </li>
                                <li className="flex items-center text-neutral-300">
                                    <RiCheckLine className="mr-3 size-4 shrink-0 text-neutral-400" />
                                    <span>Habit tracking (3 max)</span>
                                </li>
                                <li className="flex items-center text-neutral-300">
                                    <RiCheckLine className="mr-3 size-4 shrink-0 text-neutral-400" />
                                    <span>1 annual goal + 1 quarterly</span>
                                </li>
                                <li className="flex items-center text-neutral-300">
                                    <RiCheckLine className="mr-3 size-4 shrink-0 text-neutral-400" />
                                    <span>Basic analytics</span>
                                </li>
                                <li className="flex items-center text-neutral-300">
                                    <RiCheckLine className="mr-3 size-4 shrink-0 text-neutral-400" />
                                    <span>Community access</span>
                                </li>
                            </ul>

                            <Link
                                className="block w-full transform rounded-xl bg-neutral-700 py-3 text-center font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-neutral-600"
                                href={PAGES.SIGN_UP}
                            >
                                Start Free
                            </Link>
                        </div>

                        {/* Altioran Plan - Featured */}
                        <div className="relative transform rounded-2xl border-2 border-purple-500/60 bg-linear-to-br from-purple-500/20 to-purple-600/10 p-10 backdrop-blur-xs transition-all duration-300 hover:scale-105 hover:border-purple-500/80 lg:z-10 lg:scale-110">
                            <div className="-top-4 -translate-x-1/2 absolute left-1/2 transform">
                                <span className="flex items-center gap-2 rounded-full bg-linear-to-r from-purple-400 to-purple-600 px-6 py-2 font-bold text-sm text-white">
                                    <RiVipCrownLine className="size-5" />
                                    Altioran
                                </span>
                            </div>

                            <div className="mb-8">
                                <h3 className="mb-3 font-bold text-3xl text-white">
                                    Altioran
                                </h3>
                                <p className="mb-6 text-gray-300">
                                    Unlimited access to everything
                                </p>

                                <div className="mb-3 flex items-baseline">
                                    <span className="font-bold text-6xl text-white">
                                        €15
                                    </span>
                                    <span className="ml-2 text-gray-300">
                                        / month
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm">
                                    €150/year (save 17%)
                                </p>
                            </div>

                            <ul className="mb-8 space-y-4">
                                <li className="flex items-center text-gray-300">
                                    <RiLightbulbFlashLine className="mr-3 size-5 shrink-0 text-purple-400" />
                                    <span>
                                        <strong className="text-white">
                                            Unlimited trading journal
                                        </strong>
                                    </span>
                                </li>
                                <li className="flex items-center text-gray-300">
                                    <RiLightbulbFlashLine className="mr-3 size-5 shrink-0 text-purple-400" />
                                    <span>
                                        <strong className="text-white">
                                            Unlimited habit tracking
                                        </strong>
                                    </span>
                                </li>
                                <li className="flex items-center text-gray-300">
                                    <RiLightbulbFlashLine className="mr-3 size-5 shrink-0 text-purple-400" />
                                    <span>
                                        <strong className="text-white">
                                            Unlimited goal planning
                                        </strong>
                                    </span>
                                </li>
                                <li className="flex items-center text-gray-300">
                                    <RiLightbulbFlashLine className="mr-3 size-5 shrink-0 text-purple-400" />
                                    <span>
                                        <strong className="text-white">
                                            Virtual assistant & Pomodoro
                                        </strong>
                                    </span>
                                </li>
                                <li className="flex items-center text-gray-300">
                                    <RiLightbulbFlashLine className="mr-3 size-5 shrink-0 text-purple-400" />
                                    <span>
                                        <strong className="text-white">
                                            Deep work tracking
                                        </strong>
                                    </span>
                                </li>
                                <li className="flex items-center text-gray-300">
                                    <RiLightbulbFlashLine className="mr-3 size-5 shrink-0 text-purple-400" />
                                    <span>
                                        <strong className="text-white">
                                            Discord integration
                                        </strong>
                                    </span>
                                </li>
                                <li className="flex items-center text-gray-300">
                                    <RiLightbulbFlashLine className="mr-3 size-5 shrink-0 text-purple-400" />
                                    <span>
                                        <strong className="text-white">
                                            Priority support
                                        </strong>
                                    </span>
                                </li>
                            </ul>

                            <ProButton />
                        </div>

                        {/* Private Coaching Plan */}
                        <div className="relative rounded-2xl border border-neutral-700 bg-linear-to-br from-neutral-800/50 to-neutral-900/50 p-6 backdrop-blur-xs transition-all duration-300 hover:border-neutral-600">
                            <div className="absolute top-4 right-4">
                                <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-medium text-gray-300 text-sm">
                                    <RiMessageLine className="size-4" />
                                    Private
                                </span>
                            </div>

                            <div className="mb-6">
                                <h3 className="mb-2 font-bold text-white text-xl">
                                    Private Coaching
                                </h3>
                                <p className="mb-4 text-gray-400">
                                    Personalized transformation
                                </p>

                                <div className="mb-4 flex items-baseline">
                                    <span className="font-bold text-3xl text-white">
                                        Custom
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm">
                                    Contact for quote
                                </p>
                            </div>

                            <ul className="mb-6 space-y-3">
                                <li className="flex items-center text-neutral-300">
                                    <RiSparklingLine className="mr-3 size-4 shrink-0 text-neutral-400" />
                                    <span>
                                        <strong className="text-white">
                                            Everything Altioran, plus:
                                        </strong>
                                    </span>
                                </li>
                                <li className="flex items-center text-neutral-300">
                                    <RiSparklingLine className="mr-3 size-4 shrink-0 text-neutral-400" />
                                    <span>
                                        <strong className="text-white">
                                            1-on-1 coaching sessions
                                        </strong>
                                    </span>
                                </li>
                                <li className="flex items-center text-neutral-300">
                                    <RiSparklingLine className="mr-3 size-4 shrink-0 text-neutral-400" />
                                    <span>
                                        <strong className="text-white">
                                            Personalized life improvement
                                        </strong>
                                    </span>
                                </li>
                                <li className="flex items-center text-neutral-300">
                                    <RiSparklingLine className="mr-3 size-4 shrink-0 text-neutral-400" />
                                    <span>
                                        <strong className="text-white">
                                            Custom goal strategies
                                        </strong>
                                    </span>
                                </li>
                                <li className="flex items-center text-neutral-300">
                                    <RiSparklingLine className="mr-3 size-4 shrink-0 text-neutral-400" />
                                    <span>
                                        <strong className="text-white">
                                            Accountability partner
                                        </strong>
                                    </span>
                                </li>
                                <li className="flex items-center text-neutral-300">
                                    <RiSparklingLine className="mr-3 size-4 shrink-0 text-neutral-400" />
                                    <span>
                                        <strong className="text-white">
                                            24/7 priority support
                                        </strong>
                                    </span>
                                </li>
                            </ul>

                            <Link
                                className="block w-full transform rounded-xl bg-neutral-700 py-3 text-center font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-neutral-600"
                                href={PAGES.CONTACT_US}
                            >
                                Get Quote
                            </Link>
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-16 text-center">
                        <p className="mb-4 text-gray-400">
                            No hidden fees. Cancel anytime. Start building your
                            discipline today.
                        </p>
                        <div className="flex items-center justify-center space-x-6 text-gray-500 text-sm">
                            <span>✓ 14-day money-back guarantee</span>
                            <span>✓ Secure payment</span>
                            <span>✓ No commitment</span>
                        </div>
                    </div>
                </div>

                {/* Testimonials - Moving Left */}
                <div className="mt-20 w-full">
                    <h2 className="mb-8 text-center font-bold text-3xl text-white">
                        What our users say
                    </h2>
                    <InfiniteMovingCards
                        className="mb-2"
                        direction="left"
                        items={testimonials1}
                        speed="slow"
                    />
                    <InfiniteMovingCards
                        direction="right"
                        items={testimonials2}
                        speed="slow"
                    />
                </div>
            </section>
        </>
    );
}
