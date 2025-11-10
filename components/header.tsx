import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";
import { cn } from "@/lib/utils";
import { DropdownUser } from "./dropdown-user";

export const Header = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <header
            className={cn(
                "sticky top-0 right-0 left-0 z-30 border-white/10 border-b bg-transparent backdrop-blur-md",
                className
            )}
            {...props}
        >
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center">
                    <div className="flex-1" />

                    <div className="flex flex-1 items-center text-sm">
                        <div className="flex flex-1 items-center justify-end gap-4">
                            <Link
                                className="text-neutral-400 transition-colors duration-200 hover:text-neutral-50"
                                href={PAGES.ABOUT_US}
                            >
                                About
                            </Link>

                            <Link
                                className="text-neutral-400 transition-colors duration-200 hover:text-neutral-50"
                                href={PAGES.PRICING}
                            >
                                Pricing
                            </Link>
                        </div>
                        <Link
                            className="mx-8 flex items-center justify-center"
                            href={PAGES.LANDING_PAGE}
                        >
                            <Image
                                alt="Altiora Logo"
                                className="h-10 shrink-0"
                                height={40}
                                priority
                                src="/img/logo.png"
                                width={40}
                            />
                        </Link>
                        <div className="flex flex-1 items-center gap-4">
                            <Link
                                className="text-neutral-400 transition-colors duration-200 hover:text-neutral-50"
                                href={PAGES.CONTACT_US}
                            >
                                Contact
                            </Link>
                            <Link
                                className="text-neutral-400 transition-colors duration-200 hover:text-neutral-50"
                                href={PAGES.CHANGELOG}
                            >
                                Changelog
                            </Link>
                        </div>
                    </div>

                    {/* Auth Section - Right */}
                    <div className="z-10 ml-auto flex flex-1 items-center justify-end space-x-3">
                        <Suspense>
                            <HeaderLoggedIn />
                        </Suspense>
                    </div>
                </div>
            </div>
        </header>
    );
};

async function HeaderLoggedIn() {
    const session = await getServerSession();

    return (
        <>
            {session?.user ? (
                <DropdownUser user={session.user} />
            ) : (
                <Link
                    className="group rounded-xl border border-white/20 px-4 py-2 font-semibold text-sm text-white/80 tracking-wider backdrop-blur-xs transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:text-white"
                    href={PAGES.SIGN_IN}
                >
                    <span className="relative">
                        Login
                        <div className="-bottom-1 absolute left-0 h-px w-0 bg-white/60 transition-all duration-300 group-hover:w-full" />
                    </span>
                </Link>
            )}
        </>
    );
}
