import { RiArrowLeftLine } from "@remixicon/react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function AboutPage() {
    return (
        <>
            <Header />

            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="mb-2 font-argesta font-bold text-3xl text-white">
                        About
                    </h1>
                    <p className="text-white/60">
                        A developer and a trader, one vision: democratize
                        trading tools and personal development.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <Card className="border border-white/10 bg-black/20">
                        <CardHeader>
                            <CardTitle className="text-white">Sx</CardTitle>
                            <CardDescription className="text-white/60">
                                Developer & Founder
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-white/80 leading-relaxed">
                                Developer passionate about grinding and personal
                                growth. Built Altiora to create tools that help
                                others achieve their goals with the same
                                discipline I apply to my own development.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded bg-white/10 px-2 py-1 text-white/70 text-xs">
                                    TypeScript
                                </span>
                                <span className="rounded bg-white/10 px-2 py-1 text-white/70 text-xs">
                                    Next.js
                                </span>
                                <span className="rounded bg-white/10 px-2 py-1 text-white/70 text-xs">
                                    Discipline
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-white/10 bg-black/20">
                        <CardHeader>
                            <CardTitle className="text-white">Troxxy</CardTitle>
                            <CardDescription className="text-white/60">
                                Trader & Co-founder
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-white/80 leading-relaxed">
                                Trader with 5+ years experience. Tired of
                                overpriced, poorly designed trading journals.
                                We&apos;re changing that.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded bg-white/10 px-2 py-1 text-white/70 text-xs">
                                    Trading
                                </span>
                                <span className="rounded bg-white/10 px-2 py-1 text-white/70 text-xs">
                                    Risk Management
                                </span>
                                <span className="rounded bg-white/10 px-2 py-1 text-white/70 text-xs">
                                    Mentoring
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-white/10 bg-black/20">
                        <CardHeader>
                            <CardTitle className="text-white">Matteo</CardTitle>
                            <CardDescription className="text-white/60">
                                Developer
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-white/80 leading-relaxed">
                                Highly motivated developer who joined the
                                project with exceptional skills and drive.
                                Bringing fresh perspective and technical
                                expertise to push Altiora forward.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded bg-white/10 px-2 py-1 text-white/70 text-xs">
                                    Full-Stack
                                </span>
                                <span className="rounded bg-white/10 px-2 py-1 text-white/70 text-xs">
                                    Architecture
                                </span>
                                <span className="rounded bg-white/10 px-2 py-1 text-white/70 text-xs">
                                    Excellence
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-white/40">
                        Fair prices • Clean tools • Real results
                    </p>
                </div>

                <div className="mt-8 flex justify-start">
                    <Link href="/">
                        <Button
                            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                            variant="outline"
                        >
                            <RiArrowLeftLine className="size-4" />
                            Back to home
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
