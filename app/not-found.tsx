import Link from "next/link";
import BlurText from "@/components/landing/BlurText";
import ShinyText from "@/components/landing/ShinyText";
import { Header } from "@/components/layout/Header";
import Silk from "@/components/Silk/Silk";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export default function NotFoundPage() {
    return (
        <>
            <Header />
            <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-pure-black">
                {/* Background Silk Animation */}
                <div className="absolute inset-0 h-full w-full">
                    <Silk
                        color="#0a0a0a"
                        noiseIntensity={2}
                        rotation={45}
                        scale={1.2}
                        speed={3}
                    />
                </div>

                {/* Geometric Elements */}
                <div className="absolute top-20 left-20 h-6 w-6 rotate-45 animate-pulse-slow border border-white/20" />
                <div className="absolute top-32 right-32 h-8 w-8 rotate-12 animate-pulse-reverse border border-white/15" />
                <div className="absolute bottom-40 left-40 h-4 w-4 animate-pulse-fast rounded-full bg-white/10" />
                <div className="absolute right-20 bottom-60 h-10 w-10 rotate-45 animate-pulse-slow border border-white/25" />
                <div className="absolute top-1/2 left-10 h-3 w-3 animate-pulse-fast rounded-full bg-white/20" />
                <div className="absolute top-1/3 right-10 h-5 w-5 rotate-45 animate-pulse-reverse border border-white/30" />

                {/* Floating Lines */}
                <div className="-translate-y-1/2 absolute top-1/2 left-8 z-20 transform space-y-8 opacity-40">
                    <div className="h-32 w-px animate-pulse-slow bg-linear-to-b from-transparent via-white/30 to-transparent" />
                    <div className="h-24 w-px animate-pulse-reverse bg-linear-to-b from-transparent via-white/20 to-transparent" />
                </div>

                <div className="-translate-y-1/2 absolute top-1/2 right-8 z-20 transform space-y-8 opacity-40">
                    <div className="h-24 w-px animate-pulse-reverse bg-linear-to-b from-transparent via-white/20 to-transparent" />
                    <div className="h-32 w-px animate-pulse-slow bg-linear-to-b from-transparent via-white/30 to-transparent" />
                </div>

                {/* Main Content */}
                <div className="relative z-30 mx-auto flex max-w-4xl flex-col items-center justify-center overflow-hidden px-8 text-pure-white">
                    {/* 404 Number */}
                    <div className="z-10 mb-12 flex flex-col items-center justify-center">
                        <h1 className="pointer-events-none select-none whitespace-nowrap bg-linear-to-b from-white via-gray-300 to-gray-500 bg-clip-text font-argesta text-[15vw] text-transparent leading-none opacity-80 sm:text-[12vw] md:text-[8vw] lg:text-[6vw]">
                            404
                        </h1>

                        {/* Error Messages */}
                        <ShinyText
                            className="pointer-events-none mb-6 select-none whitespace-nowrap font-bold text-[1.5vw] text-pure-white opacity-70 sm:text-[1.2vw] md:text-[1vw] lg:text-[0.8vw]"
                            speed={6}
                            text="Page Not Found"
                        />

                        <BlurText
                            className="pointer-events-none max-w-2xl select-none text-center text-[1vw] text-pure-white/60 sm:text-[0.9vw] md:text-[0.8vw] lg:text-[0.7vw]"
                            delay={50}
                            text="The page you're looking for doesn't exist."
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center">
                        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                            <Link href="/">
                                <HoverBorderGradient
                                    className="bg-pure-black text-white opacity-70 transition-opacity duration-300 hover:opacity-90"
                                    containerClassName="bg-pure-black"
                                >
                                    <span className="px-4 py-2 text-sm">
                                        Go Home
                                    </span>
                                </HoverBorderGradient>
                            </Link>

                            <Link href="/dashboard">
                                <HoverBorderGradient
                                    className="bg-pure-black text-white opacity-70 transition-opacity duration-300 hover:opacity-90"
                                    containerClassName="bg-pure-white"
                                >
                                    <span className="px-4 py-2 text-sm">
                                        Dashboard
                                    </span>
                                </HoverBorderGradient>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
