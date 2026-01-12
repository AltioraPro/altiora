"use client";

import { PAGES } from "@/constants/pages";
import { cn } from "@/lib/utils";
import { RiArrowRightLine, RiCloseLine, RiMenuLine } from "@remixicon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { ScrollNavigation } from "./scroll-navigation";
import { Button } from "./ui/button";

const navigationLinks = [
    {
        label: "Features",
        href: "/#features",
        sectionId: "#features",
        number: "01",
    },
    {
        label: "Pricing",
        href: "/#pricing",
        sectionId: "#pricing",
        number: "02",
    },
    { label: "FAQ", href: "/#faq", sectionId: "#faq", number: "03" },
    {
        label: "Changelog",
        href: PAGES.CHANGELOG,
        sectionId: null,
        number: "04",
    },
] as const;

export const Header = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <header
                className={cn(
                    "sticky top-0 right-0 left-0 z-50 border-neutral-800 border-b bg-background",
                    className
                )}
                {...props}
            >
                <div className="mx-auto max-w-7xl border-neutral-800 border-r border-l bg-transparent px-4 sm:px-4 lg:px-6">
                    <div className="relative flex h-16 items-center">
                        {/* Logo - Left */}
                        <div className="flex-1">
                            <Link
                                className="transition-none"
                                href={PAGES.LANDING_PAGE}
                                onClick={handleLinkClick}
                            >
                                <Logo className="h-5 w-fit" />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex">
                            <ScrollNavigation />
                        </div>

                        {/* Desktop Auth Section - Right */}
                        <div className="z-10 ml-auto hidden flex-1 items-center justify-end space-x-3 md:flex">
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

                        {/* Mobile Burger Button - Right */}
                        <button
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle menu"
                            className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-neutral-400 transition-colors hover:text-neutral-50 md:hidden"
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            type="button"
                        >
                            {isMobileMenuOpen ? (
                                <RiCloseLine className="size-6" />
                            ) : (
                                <RiMenuLine className="size-6" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <MobileMenuOverlay
                handleLinkClick={handleLinkClick}
                isMobileMenuOpen={isMobileMenuOpen}
            />
        </>
    );
};

function MobileMenuOverlay({
    isMobileMenuOpen,
    handleLinkClick,
}: {
    isMobileMenuOpen: boolean;
    handleLinkClick: () => void;
}) {
    return (
        <div
            className={cn(
                "fixed inset-0 z-40 bg-background transition-all duration-300 ease-in-out md:hidden",
                isMobileMenuOpen
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-full pointer-events-none opacity-0"
            )}
        >
            <div className="flex h-full flex-col pt-20">
                {/* Mobile Navigation Links */}
                <nav className="flex flex-1 flex-col gap-1 px-4">
                    {navigationLinks.map((link) => (
                        <Link
                            className="flex items-center gap-2 rounded-lg px-4 py-4 font-medium text-lg text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-50"
                            href={link.href}
                            key={link.href}
                            onClick={handleLinkClick}
                        >
                            <span>{link.label}</span>
                            <span className="text-neutral-500 text-xs">
                                ({link.number})
                            </span>
                        </Link>
                    ))}
                </nav>

                {/* Mobile Auth Section */}
                <div className="border-neutral-800 border-t p-4">
                    <div className="flex flex-col gap-3">
                        <Button asChild variant="outline">
                            <Link
                                href={PAGES.SIGN_IN}
                                onClick={handleLinkClick}
                            >
                                Login
                            </Link>
                        </Button>

                        <Button asChild className="w-full">
                            <Link
                                href={PAGES.SIGN_UP}
                                onClick={handleLinkClick}
                            >
                                Get started
                                <RiArrowRightLine className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
