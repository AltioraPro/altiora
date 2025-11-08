import Link from "next/link";
import { DropdownUser } from "@/components/dropdown-user";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./mobile-menu";

export const Header = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <header
        className={cn(
            "flex h-[70px] border-white/10 border-b bg-transparent backdrop-blur-md",
            className
        )}
        {...props}
    >
        <div className="mx-auto flex h-full w-full items-center justify-end px-4 sm:px-6 lg:px-8">
            <MobileMenu />
            <div className="z-10 ml-auto flex flex-1 items-center justify-end space-x-3">
                <HeaderLoggedIn />
            </div>
        </div>
    </header>
);

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
