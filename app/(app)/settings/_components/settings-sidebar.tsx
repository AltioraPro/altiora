import {
    RiApps2AddLine,
    RiArrowDownSLine,
    RiGlobalLine,
    RiLockLine,
    RiMessage3Line,
    RiUserLine,
} from "@remixicon/react";
import Link from "next/link";
import { useState } from "react";
import { PAGES } from "@/constants/pages";
import { cn } from "@/lib/utils";
import { withQuery } from "@/lib/utils/routes";

export const navigationItems = [
    {
        label: "Account",
        items: [
            {
                href: "account-billing",
                label: "Account & Billing",
                icon: RiUserLine,
            },
            {
                href: "security",
                label: "Security",
                icon: RiLockLine,
            },
            {
                href: "contact",
                label: "Contact Us",
                icon: RiMessage3Line,
            },
        ],
    },
    {
        label: "Préférences",
        items: [
            {
                href: "privacy",
                label: "Privacy",
                icon: RiGlobalLine,
            },
            {
                href: "integrations",
                label: "Integrations",
                icon: RiApps2AddLine,
            },
        ],
    },
] as const;

interface SettingsSidebarProps {
    currentPage: string | null;
}

export function SettingsSidebar({ currentPage }: SettingsSidebarProps) {
    const [manualToggles, setManualToggles] = useState<Record<string, boolean>>(
        {}
    );

    return (
        <aside
            className={cn(
                "ml-6 hidden w-64 shrink-0 pt-8 md:block",
                !currentPage && "hidden md:block"
            )}
        >
            <nav>
                <div className="flex flex-col gap-4">
                    {navigationItems.map((section) => {
                        const isSectionActive = section.items.some(
                            (item) =>
                                currentPage === item.href ||
                                (!currentPage &&
                                    item.href === "account-billing")
                        );
                        const isOpen =
                            manualToggles[section.label] ?? isSectionActive;

                        const toggleSection = () => {
                            setManualToggles((prev) => ({
                                ...prev,
                                [section.label]: !isOpen,
                            }));
                        };

                        return (
                            <div
                                className="flex flex-col gap-2 px-4"
                                key={section.label}
                            >
                                <button
                                    className="flex w-full items-center justify-between px-3.5 py-1 text-left transition-colors hover:bg-neutral-800/50"
                                    onClick={toggleSection}
                                    type="button"
                                >
                                    <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                                        {section.label}
                                    </span>
                                    <RiArrowDownSLine
                                        className={cn(
                                            "size-3.5 text-muted-foreground transition-transform duration-200",
                                            isOpen && "rotate-180"
                                        )}
                                    />
                                </button>

                                <div
                                    className={cn(
                                        "flex flex-col gap-1 transition-all duration-300 overflow-hidden",
                                        !isOpen
                                            ? "max-h-0 opacity-0"
                                            : "max-h-[500px] opacity-100"
                                    )}
                                >
                                    {section.items.map((item) => {
                                        const isActive =
                                            currentPage === item.href ||
                                            (!currentPage &&
                                                item.href ===
                                                    "account-billing");

                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                className={cn(
                                                    "flex h-[40px] items-center gap-2.5 border border-transparent px-3",
                                                    "text-neutral-400 text-sm hover:text-pure-white",
                                                    isActive &&
                                                        "border-neutral-700 bg-neutral-900 text-pure-white"
                                                )}
                                                href={withQuery(
                                                    PAGES.SETTINGS,
                                                    {
                                                        page: item.href,
                                                    }
                                                )}
                                                key={item.href}
                                                onClick={() => {
                                                    // Ensure section stays open when navigating
                                                    setManualToggles(
                                                        (prev) => ({
                                                            ...prev,
                                                            [section.label]: true,
                                                        })
                                                    );
                                                }}
                                            >
                                                <Icon size={20} />
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </nav>
        </aside>
    );
}
