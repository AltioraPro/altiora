import {
    RiApps2AddLine,
    RiGlobalLine,
    RiLockLine,
    RiMessage3Line,
    RiUserLine,
} from "@remixicon/react";
import Link from "next/link";
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
    return (
        <aside
            className={cn(
                "ml-6 hidden w-64 shrink-0 pt-8 md:block",
                !currentPage && "hidden md:block"
            )}
        >
            <nav>
                <div className="flex flex-col gap-4">
                    {navigationItems.map((item) => (
                        <div
                            className="flex flex-col gap-2 px-4"
                            key={item.label}
                        >
                            <span className="ml-3.5 font-medium text-muted-foreground text-xs">
                                {item.label}
                            </span>

                            <div className="flex flex-col gap-1">
                                {item.items.map((item) => {
                                    const isActive =
                                        currentPage === item.href ||
                                        (!currentPage &&
                                            item.href === "account-billing");

                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            className={cn(
                                                "flex h-[40px] items-center gap-2.5 border border-transparent px-3",
                                                "text-neutral-400 text-sm hover:text-pure-white",
                                                isActive &&
                                                    "border-neutral-700 bg-neutral-900 text-pure-white"
                                            )}
                                            href={withQuery(PAGES.SETTINGS, {
                                                page: item.href,
                                            })}
                                            key={item.href}
                                        >
                                            <Icon size={20} />

                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>
        </aside>
    );
}
