import Image from "next/image";
import Link from "next/link";
import Dither from "@/app/(marketing)/_components/dither";
import { PAGES } from "@/constants/pages";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen p-4">
            {/* Left section - Form */}
            <div className="flex w-full flex-col justify-center pt-12 lg:w-1/2">
                <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center space-y-8">
                    {/* Form title */}
                    <div className="mb-8">
                        <h2 className="mb-2 font-bold font-serif text-2xl text-white">
                            Welcome back
                        </h2>
                        <p className="text-muted-foreground">
                            Sign in to continue your journey
                        </p>
                    </div>

                    <LoginForm />
                </div>
                <p className="mt-8 text-center text-muted-foreground text-xs">
                    By signing in you agree to our{" "}
                    <Link
                        className="font-medium underline transition-colors hover:text-gray-300"
                        href={PAGES.TERMS_OF_SERVICE}
                    >
                        Terms of service
                    </Link>{" "}
                    &{" "}
                    <Link
                        className="font-medium underline transition-colors hover:text-gray-300"
                        href={PAGES.PRIVACY_POLICY}
                    >
                        Privacy policy
                    </Link>
                </p>
            </div>

            {/* Right section - Image */}
            <div className="relative hidden overflow-hidden border border-neutral-900 lg:flex lg:w-1/2 lg:items-center lg:justify-end">
                <div className="absolute inset-0 z-0 size-full opacity-50">
                    <Dither
                        colorNum={4}
                        disableAnimation={false}
                        enableMouseInteraction={false}
                        waveAmplitude={0}
                        waveColor={[0.4, 0.4, 0.4]}
                        waveFrequency={3}
                        waveSpeed={0.005}
                    />
                </div>
                <Image
                    alt="Altiora Dashboard"
                    className="z-40 size-5/6 object-cover object-left"
                    height={1000}
                    priority
                    src="/img/hero-journal3.png"
                    width={1000}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-background to-transparent" />
            </div>
        </div>
    );
}
