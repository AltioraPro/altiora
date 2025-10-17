import BlurText from "@/components/landing/BlurText";
import ShinyText from "@/components/landing/ShinyText";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Header } from "@/components/layout/Header";
import { ArrowLeft, Home, Search, AlertTriangle, Compass } from "lucide-react";
import Link from "next/link";
import Silk from "@/components/Silk/Silk";

export default function NotFoundPage() {
    return (
        <>
            <Header />
            <section className="h-screen w-full flex items-center justify-center bg-pure-black relative overflow-hidden">
                {/* Background Silk Animation */}
                <div className="absolute inset-0 w-full h-full">
                    <Silk
                        speed={3}
                        scale={1.2}
                        color="#0a0a0a"
                        noiseIntensity={2}
                        rotation={45}
                    />
                </div>

                {/* Geometric Elements */}
                <div className="absolute top-20 left-20 w-6 h-6 border border-white/20 rotate-45 animate-pulse-slow"></div>
                <div className="absolute top-32 right-32 w-8 h-8 border border-white/15 rotate-12 animate-pulse-reverse"></div>
                <div className="absolute bottom-40 left-40 w-4 h-4 bg-white/10 rounded-full animate-pulse-fast"></div>
                <div className="absolute bottom-60 right-20 w-10 h-10 border border-white/25 rotate-45 animate-pulse-slow"></div>
                <div className="absolute top-1/2 left-10 w-3 h-3 bg-white/20 rounded-full animate-pulse-fast"></div>
                <div className="absolute top-1/3 right-10 w-5 h-5 border border-white/30 rotate-45 animate-pulse-reverse"></div>

                {/* Floating Lines */}
                <div className="absolute left-8 top-1/2 transform -translate-y-1/2 space-y-8 opacity-40 z-20">
                    <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-pulse-slow"></div>
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse-reverse"></div>
                </div>

                <div className="absolute right-8 top-1/2 transform -translate-y-1/2 space-y-8 opacity-40 z-20">
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse-reverse"></div>
                    <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-pulse-slow"></div>
                </div>

                {/* Main Content */}
                <div className="text-pure-white relative overflow-hidden flex items-center justify-center flex-col z-30 max-w-4xl mx-auto px-8">
                    {/* 404 Number */}
                    <div className="flex items-center justify-center flex-col z-10 mb-12">
                        <h1 className="text-[15vw] sm:text-[12vw] md:text-[8vw] lg:text-[6vw] bg-gradient-to-b from-white via-gray-300 to-gray-500 bg-clip-text text-transparent opacity-80 select-none pointer-events-none whitespace-nowrap font-argesta leading-none">
                            404
                        </h1>

                        {/* Error Messages */}
                        <ShinyText
                            text="Page Not Found"
                            className="text-[1.5vw] sm:text-[1.2vw] md:text-[1vw] lg:text-[0.8vw] font-bold text-pure-white opacity-70 select-none pointer-events-none whitespace-nowrap mb-6"
                            speed={6}
                        />

                        <BlurText
                            text="The page you're looking for doesn't exist."
                            className="text-[1vw] sm:text-[0.9vw] md:text-[0.8vw] lg:text-[0.7vw] text-pure-white/60 select-none pointer-events-none text-center max-w-2xl"
                            delay={50}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center">
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <Link href="/">
                                <HoverBorderGradient
                                    containerClassName="bg-pure-black"
                                    className="bg-pure-black text-white opacity-70 hover:opacity-90 transition-opacity duration-300"
                                >
                                    <span className="px-4 py-2 text-sm">
                                        Go Home
                                    </span>
                                </HoverBorderGradient>
                            </Link>

                            <Link href="/dashboard">
                                <HoverBorderGradient
                                    containerClassName="bg-pure-white"
                                    className="bg-pure-black text-white opacity-70 hover:opacity-90 transition-opacity duration-300"
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
