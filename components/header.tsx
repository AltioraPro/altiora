import { RiArrowRightLine } from "@remixicon/react";
import Link from "next/link";
import { PAGES } from "@/constants/pages";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ScrollNavigation } from "./scroll-navigation";
import { Button } from "./ui/button";

export const Header = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <header
            className={cn(
                "sticky top-0 right-0 left-0 z-50 border-neutral-800 border-b bg-background",
                className
            )}
            {...props}
        >
            <div className="mx-auto max-w-7xl border-neutral-800 border-r border-l bg-transparent px-4 sm:px-4 lg:px-6">
                <div className="relative flex h-16 items-center">
                    <div className="flex-1">
                        <Link
                            className="transition-none"
                            href={PAGES.LANDING_PAGE}
                        >
                            <Logo className="h-5 w-fit" />
                        </Link>
                    </div>

                    <ScrollNavigation />

                    {/* Auth Section - Right */}
                    <div className="z-10 ml-auto flex flex-1 items-center justify-end space-x-3">
                        <Button asChild variant="ghost">
                            <Link href={PAGES.SIGN_IN}>Login</Link>
                        </Button>

                        <Button asChild>
                            <Link href={PAGES.SIGN_UP}>
                                Get started
                                <RiArrowRightLine className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};
