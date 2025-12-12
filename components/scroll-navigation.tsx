"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { PAGES } from "@/constants/pages";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";

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

export function ScrollNavigation() {
    const pathname = usePathname();
    const sectionIds = useMemo(
        () =>
            navigationLinks
                .filter((l) => l.sectionId !== null)
                .map((l) => l.sectionId as string),
        []
    );

    const activeSection = useActiveSection(sectionIds);

    return (
        <nav
            aria-label="Main navigation"
            className="scroll-target-nav flex flex-1 items-center justify-center text-sm"
        >
            {navigationLinks.map((link) => {
                const isAnchorLink = link.sectionId !== null;
                const isActive =
                    (isAnchorLink && activeSection === link.sectionId) ||
                    (link.sectionId === null && pathname === PAGES.CHANGELOG);

                return (
                    <Link
                        className={cn(
                            "nav-link flex items-center gap-1 px-3.5 py-2 text-neutral-400 transition-colors hover:text-neutral-50",
                            isActive && "bg-neutral-800 text-neutral-50"
                        )}
                        data-active={isActive}
                        href={link.href}
                        key={link.href}
                    >
                        <span>{link.label}</span>
                        <span className="-translate-y-1 text-[9px]">
                            ({link.number})
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
