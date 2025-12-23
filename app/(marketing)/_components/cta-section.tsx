import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/constants/pages";
import { Section } from "./section";

interface CTASectionProps {
    id?: string;
}

export function CTASection({ id }: CTASectionProps) {
    const heights = [
        "h-8",
        "h-9",
        "h-10",
        "h-11",
        "h-12",
        "h-14",
        "h-16",
        "h-20",
    ];

    return (
        <Section className="mt-40" id={id}>
            <div className="relative z-10 mx-auto flex min-h-96 w-full flex-col items-center justify-center gap-6 bg-neutral-900 px-6 py-8">
                <h2 className="text-center font-medium text-4xl sm:text-6xl">
                    Try Altiora now.
                </h2>
                <Button asChild size="lg">
                    <Link href={PAGES.SIGN_UP}>Get started</Link>
                </Button>

                <div className="-z-10 absolute inset-0 flex items-end justify-between px-1">
                    {Array.from({ length: 100 }, (_, i) => {
                        const randomHeight =
                            heights[Math.floor(Math.random() * heights.length)];
                        return (
                            <div
                                className={`${randomHeight} w-0.5 bg-neutral-700`}
                                key={i}
                            />
                        );
                    })}
                </div>
            </div>
        </Section>
    );
}
