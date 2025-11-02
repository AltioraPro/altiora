import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./logout-button";

export const Header = async ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const session = await getServerSession();

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
                            className="flex flex-1 items-center justify-center"
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
                        {session?.user ? (
                            /* User Profile - Connecté */
                            <div className="flex items-center space-x-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm text-white/80 hover:border-white/40 hover:bg-white/5 hover:text-white">
                                        <div className="flex size-6 items-center justify-center rounded-full bg-white/10">
                                            <User className="size-3" />
                                        </div>
                                        {session.user.name.split(" ")[0]}
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>
                                            <Link href={PAGES.PROFILE}>
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Link href={PAGES.SETTINGS}>
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <LogoutButton>
                                                Sign Out
                                            </LogoutButton>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
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
                    </div>
                </div>
            </div>
        </header>
    );
};
