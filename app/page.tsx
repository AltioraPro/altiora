import {
    ArrowRight,
    BarChart3,
    ChevronDown,
    Clock,
    Star,
    Target,
    TrendingUp,
    Zap,
} from "lucide-react";
import Link from "next/link";
import BlurText from "@/components/landing/BlurText";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import ShinyText from "@/components/landing/ShinyText";
import { Header } from "@/components/layout/Header";
import Silk from "@/components/Silk/Silk";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export default function HomePage() {
    return (
        <>
            <Header />
            <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-center bg-cover bg-no-repeat grayscale">
                <div className="absolute inset-0 h-full w-full">
                    <Silk
                        color="#121112"
                        noiseIntensity={1.5}
                        rotation={0}
                        scale={1}
                        speed={5}
                    />
                </div>

                <div
                    className="-translate-x-1/2 pointer-events-none absolute bottom-0 left-1/2 z-10 h-[60%] w-[120%] transform opacity-50"
                    style={{
                        background:
                            "radial-gradient(ellipse at center bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)",
                    }}
                />

                <div className="-translate-y-1/2 absolute top-1/2 left-8 z-20 transform space-y-8 opacity-60">
                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center space-x-3">
                            <TrendingUp className="h-6 w-6 text-white" />
                            <span className="text-sm text-white">TRADING</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Target className="h-6 w-6 text-white" />
                            <span className="text-sm text-white">GOALS</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Zap className="h-6 w-6 text-white" />
                            <span className="text-sm text-white">HABITS</span>
                        </div>
                    </div>

                    <div className="h-32 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-30" />

                    <div className="space-y-2">
                        <p className="-rotate-90 origin-left transform text-white text-xs opacity-70">
                            DISCIPLINE
                        </p>
                    </div>
                </div>

                <div className="-translate-y-1/2 absolute top-1/2 right-8 z-20 flex transform flex-col items-end space-y-8 opacity-60">
                    <div className="flex flex-col items-end space-y-6">
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-white">
                                ANALYTICS
                            </span>
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-white">TRACKING</span>
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-white">PROGRESS</span>
                            <Star className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    <div className="h-32 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-30" />

                    <div className="space-y-2">
                        <p className="origin-right rotate-90 transform text-white text-xs opacity-70">
                            FOCUS
                        </p>
                    </div>
                </div>

                <div className="absolute top-20 left-20 z-20 h-4 w-4 rotate-45 border border-white opacity-20" />
                <div className="absolute top-32 right-32 z-20 h-6 w-6 rotate-12 border border-white opacity-15" />
                <div className="absolute bottom-40 left-40 z-20 h-3 w-3 rounded-full bg-white opacity-10" />
                <div className="absolute right-20 bottom-60 z-20 h-8 w-8 rotate-45 border border-white opacity-25" />

                <div className="relative z-30 flex flex-col items-center justify-center overflow-hidden text-pure-white">
                    <div className="z-10 flex flex-col items-center justify-center">
                        <h1 className="pointer-events-none select-none whitespace-nowrap bg-gradient-to-b from-white to-gray-400 bg-clip-text font-argesta text-[13vw] text-transparent leading-none opacity-90">
                            ALTIORA
                        </h1>

                        <ShinyText
                            className="-mt-2 pointer-events-none mb-2 select-none whitespace-nowrap font-bold text-[1vw] text-pure-white opacity-90"
                            speed={8}
                            text="Personal coaching platform: trading, habits, and goals in one place."
                        />

                        <BlurText
                            className="-mt-2 pointer-events-none select-none whitespace-nowrap text-[1vw] text-pure-white opacity-90"
                            text="Your discipline, our platform."
                        />
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                            <Link href="/pricing">
                                <HoverBorderGradient
                                    className="bg-pure-black text-white opacity-70"
                                    containerClassName="bg-pure-black"
                                >
                                    <span className="flex items-center gap-2">
                                        Get Started
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </HoverBorderGradient>
                            </Link>

                            <Link href="/about">
                                <HoverBorderGradient
                                    className="bg-pure-black text-white opacity-70"
                                    containerClassName="bg-pure-white"
                                >
                                    About Us
                                </HoverBorderGradient>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="-translate-x-1/2 absolute bottom-8 left-1/2 z-30 transform">
                    <div className="flex animate-bounce flex-col items-center space-y-2">
                        <span className="text-white/50 text-xs tracking-widest">
                            EXPLORE
                        </span>
                        <ChevronDown className="h-5 w-5 text-white/50" />
                    </div>
                </div>
            </section>

            <FeaturesSection />
        </>
    );
}
