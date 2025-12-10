import { RiArrowRightLine } from "@remixicon/react";
import Link from "next/link";
import { PAGES } from "@/constants/pages";

export function ProductivitySection() {
    return (
        <div className="mt-40 flex w-full items-center justify-between gap-12 bg-neutral-900 p-4.5">
            <div className="flex max-w-[470px] flex-col gap-2 text-2xl">
                <h2 className="font-medium">Altiora for productivity</h2>
                <p className="text-neutral-400">
                    Track your deepwork sessions, set your goals and your
                    habits, follow your progress and get insights on your
                    productivity.
                </p>

                <Link
                    className="mt-2 inline-flex items-center gap-1.5 text-base hover:text-neutral-300"
                    href={PAGES.SIGN_UP}
                >
                    Get started
                    <RiArrowRightLine className="size-4" />
                </Link>
            </div>
            <div className="flex size-full min-h-[600px] flex-col items-center justify-center gap-4 bg-background">
                <div className="h-20 w-full max-w-md bg-neutral-800" />
                <div className="h-20 w-full max-w-md bg-neutral-800" />
                <div className="h-20 w-full max-w-md bg-neutral-800" />
            </div>
        </div>
    );
}
