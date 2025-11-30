import { RiCheckboxCircleLine } from "@remixicon/react";
import { SignUpForm } from "./_components/sign-up-form";

export default function RegisterPage() {
    return (
        <div className="relative min-h-screen overflow-hidden text-pure-white">
            {/* Éléments décoratifs géométriques */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-32 right-32 h-6 w-6 rotate-12 border border-white/15" />
                <div className="absolute bottom-40 left-40 h-3 w-3 animate-pulse rounded-full bg-white/10" />
                <div className="absolute right-20 bottom-60 h-8 w-8 rotate-45 border border-white/25" />

                {/* Grille de points subtile */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "50px 50px",
                    }}
                />
            </div>

            <div className="relative z-10 flex min-h-screen">
                {/* Left section - Branding */}
                <div className="hidden flex-col justify-center px-12 lg:flex lg:w-1/2 xl:px-20">
                    <div className="max-w-lg">
                        <h1 className="mb-6 bg-linear-to-b from-white to-gray-400 bg-clip-text font-argesta font-bold text-[4rem] text-transparent leading-none">
                            ALTIORA
                        </h1>

                        <div className="space-y-4 text-gray-300">
                            <p className="text-xl">
                                Start your transformation.
                            </p>
                            <p className="text-base opacity-80">
                                Create your account and join a community
                                dedicated to excellence in trading and personal
                                development.
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="mt-8 space-y-3">
                            {[
                                "Professional trading journal",
                                "Smart habit tracking",
                                "Goal planning",
                                "Discord integration",
                            ].map((benefit, index) => (
                                <div
                                    className="flex items-center space-x-3"
                                    key={index}
                                >
                                    <RiCheckboxCircleLine className="size-4 text-white/60" />
                                    <span className="text-sm text-white/70">
                                        {benefit}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Decorative line */}
                        <div className="mt-12 flex items-center space-x-4">
                            <div className="h-px w-20 bg-linear-to-r from-white to-transparent" />
                            <span className="text-white/60 text-xs tracking-widest">
                                SIGN UP
                            </span>
                            <div className="h-px w-20 bg-linear-to-l from-white to-transparent" />
                        </div>
                    </div>
                </div>

                <SignUpForm />
            </div>
        </div>
    );
}
