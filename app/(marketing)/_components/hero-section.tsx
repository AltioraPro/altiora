import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/constants/pages";
import Link from "next/link";
import { HeroImage } from "./hero-image";

export function HeroSection() {
    return (
        <section className="border-neutral-800 border-r border-l">
            <div className="px-4 pt-20 md:px-6">
                <p className="inline-flex items-center gap-1.5 bg-neutral-800 px-2 py-1 text-xs uppercase">
                    Altiora is in Beta
                </p>

                <div className="mt-6">
                    <h1 className="max-w-3xl font-normal text-3xl md:text-5xl">
                        For traders who don’t just want a journal, but a{" "}
                        <span className="font-serif text-neutral-400">
                            real growth system
                        </span>
                        .
                    </h1>

                    <p className="mt-6 max-w-xl text-neutral-400 text-sm">
                        Altiora turns your journal into a clear improvement
                        loop: track, review, get objective insights on your edge
                        and discipline.
                    </p>
                </div>

                <div>
                    <div className="mt-6 flex items-center gap-2.5">
                        <Button asChild size="lg">
                            <Link href={PAGES.SIGN_UP}>
                                Create your growth space
                            </Link>
                        </Button>

                        <Button
                            asChild
                            className="max-md:hidden"
                            size="lg"
                            variant="outline"
                        >
                            <Link href="#features">Discover our Features</Link>
                        </Button>
                    </div>
                    <p className="mt-2 text-neutral-400 text-xs">
                        14 days free trial - No card required.
                    </p>
                </div>

                <div className="mt-6 flex items-center gap-2.5">
                    <div className="-space-x-2 flex *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">
                        <Avatar className="size-6 bg-neutral-800">
                            <AvatarImage
                                alt="@maxleiter"
                                src="https://github.com/drixares.png"
                            />
                            <AvatarFallback>DR</AvatarFallback>
                        </Avatar>
                        <Avatar className="size-6 bg-neutral-800">
                            <AvatarImage
                                alt="@hugosevelin"
                                src="https://lh3.googleusercontent.com/a/ACg8ocLWIWGEkhMLPKJug38ZUHOf_nO7ZXnTslGAdRA0AH3xCCwcBeuZ=s96-c"
                            />
                            <AvatarFallback>HS</AvatarFallback>
                        </Avatar>
                        <Avatar className="size-6 bg-neutral-800">
                            <AvatarImage
                                alt="@y2"
                                src="https://lh3.googleusercontent.com/a/ACg8ocIg80xNWV61tB-iOR3Sf4jd7kLYYXwfqyDNcTMfzAYesBVhtQY=s96-c"
                            />
                            <AvatarFallback>Y2</AvatarFallback>
                        </Avatar>
                        <Avatar className="size-6 bg-neutral-800">
                            <AvatarImage
                                alt="@lionvsx"
                                src="https://github.com/lionvsx.png"
                            />
                            <AvatarFallback>LV</AvatarFallback>
                        </Avatar>
                        <Avatar className="size-6 bg-neutral-800">
                            <AvatarImage
                                alt="@17sx"
                                src="https://github.com/17sx.png"
                            />
                            <AvatarFallback>17</AvatarFallback>
                        </Avatar>
                    </div>
                    <span className="text-neutral-400 text-sm">
                        Trusted by +50 users
                    </span>
                </div>
            </div>

            <HeroImage />
        </section>
    );
}
