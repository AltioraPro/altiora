import { RiArrowRightLine } from "@remixicon/react";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeroImage } from "./_components/hero-image";
import { WaitlistForm } from "./_components/waitlist-form";

export default function HomePage() {
    return (
        <div>
            <Header />

            <main className="relative mx-auto w-full max-w-7xl overflow-hidden border-neutral-800 border-r border-l pb-20">
                <div className="px-6 pt-20">
                    <span className="inline-flex items-center gap-2 bg-neutral-800 px-2 py-1 text-xs uppercase">
                        Join the waitlist{" "}
                        <RiArrowRightLine className="size-3" />
                    </span>

                    <div className="mt-6">
                        <h1 className="max-w-3xl font-normal text-5xl">
                            For traders who don’t just want a journal, but a{" "}
                            <span className="font-serif text-neutral-400">
                                real growth system
                            </span>
                            .
                        </h1>

                        <p className="text- mt-6 max-w-xl text-neutral-400 text-sm">
                            Altiora turns your journal into a clear improvement
                            loop: track, review, get objective insights on your
                            edge and discipline.
                        </p>
                    </div>

                    <WaitlistForm />

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
            </main>
        </div>
    );
}
