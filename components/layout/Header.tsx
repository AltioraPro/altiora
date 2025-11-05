import Image from "next/image";
import Link from "next/link";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";
import { DropdownUser } from "../dropdown-user";
import { FullScreenMenu } from "./full-screen-menu";

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export const Header = async ({ className, ...props }: HeaderProps) => {
    const session = await getServerSession();

    return (
        <header
            className="sticky top-0 right-0 left-0 z-20 border border-white/10 bg-transparent backdrop-blur-md transition-transform duration-300 ease-in-out"
            {...props}
        >
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center">
                    <FullScreenMenu user={session?.user} />

                    {/* Logo - Centre absolu */}
                    <div className="-translate-x-1/2 absolute left-1/2 transform">
                        <Link
                            className="flex items-center"
                            href={PAGES.LANDING_PAGE}
                        >
                            <Image
                                alt="Altiora Logo"
                                className="h-10 w-auto"
                                height={20}
                                priority
                                src="/img/logo.png"
                                width={70}
                            />
                        </Link>
                    </div>

                    {/* Auth Section - Right */}
                    {session?.user && (
                        <div className="ml-auto flex items-center space-x-3">
                            <DropdownUser user={session.user} />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
