"use client";

import {
    RiArrowDownSLine,
    RiArrowLeftRightLine,
    RiCalendarLine,
    RiCheckboxLine,
    RiDashboardLine,
    RiSettings3Line,
    RiShieldLine,
    RiStockLine,
    RiTargetLine,
    RiTerminalLine,
    RiTimerLine,
    RiTrophyLine,
    RiUserLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PAGES } from "@/constants/pages";
import { USER_ROLES, type UserRole } from "@/constants/roles";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Item } from "./menu-item";

export const MENU_ITEMS = {
    [PAGES.DASHBOARD]: () => <RiDashboardLine size={20} />,
    [PAGES.PROFILE]: () => <RiUserLine size={20} />,
    [PAGES.GOALS]: () => <RiTargetLine size={20} />,
    [PAGES.HABITS]: () => <RiCheckboxLine size={20} />,
    [PAGES.TRADING]: () => <RiStockLine size={20} />,
    [PAGES.TRADING_JOURNALS]: () => <RiStockLine size={20} />,
    [PAGES.TRADING_CALENDAR]: () => <RiCalendarLine size={20} />,
    [PAGES.TRADING_DASHBOARD]: () => <RiDashboardLine size={20} />,
    [PAGES.LEADERBOARD]: () => <RiTrophyLine size={20} />,
    [PAGES.SETTINGS]: () => <RiSettings3Line size={20} />,
    [PAGES.ADMIN]: () => <RiShieldLine size={20} />,
} as const;

interface MenuLink {
    path: Route | "#";
    name: string;
    icon: React.ComponentType<{ size?: number | string }>;
    soon?: boolean;
    requiredRole?: UserRole;
}

interface MenuSection {
    title: string;
    items: MenuLink[];
    icon: React.ComponentType<{ size?: number | string }>;
}

const sections: MenuSection[] = [
    {
        title: "Trading",
        icon: RiStockLine,
        items: [
            {
                path: PAGES.TRADING_DASHBOARD as Route,
                name: "Dashboard",
                icon: RiDashboardLine,
            },
            {
                path: PAGES.TRADING_JOURNALS as Route,
                name: "Journals",
                icon: RiStockLine,
            },
            {
                path: PAGES.TRADING_CALENDAR as Route,
                name: "Calendar",
                icon: RiCalendarLine,
            },
            {
                path: "#",
                name: "Trade Copier",
                soon: true,
                icon: RiArrowLeftRightLine,
            },
            {
                path: "#",
                name: "Trading Terminal",
                soon: true,
                icon: RiTerminalLine,
            },
        ],
    },
    {
        title: "Personal Development",
        icon: RiTargetLine,
        items: [
            {
                path: PAGES.HABITS as Route,
                name: "Habits",
                icon: RiCheckboxLine,
            },
            { path: PAGES.GOALS as Route, name: "Goals", icon: RiTargetLine },
            {
                path: PAGES.LEADERBOARD as Route,
                name: "Leaderboard",
                icon: RiTrophyLine,
            },
            {
                path: "#",
                name: "Deep Work Stats",
                soon: true,
                icon: RiTimerLine,
            },
        ],
    },
    {
        title: "Account & Settings",
        icon: RiUserLine,
        items: [
            { path: PAGES.PROFILE as Route, name: "Profile", icon: RiUserLine },
            {
                path: PAGES.SETTINGS as Route,
                name: "Settings",
                icon: RiSettings3Line,
            },
            {
                path: PAGES.ADMIN as Route,
                name: "Admin",
                icon: RiShieldLine,
                requiredRole: USER_ROLES.ADMIN,
            },
        ],
    },
];

type Props = {
    onSelect?: () => void;
    isExpanded?: boolean;
};

export function MainMenu({ onSelect, isExpanded = false }: Props) {
    const pathname = usePathname();

    const { data: session } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const session = await authClient.getSession();
            return session?.data;
        },
    });

    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [manualToggles, setManualToggles] = useState<Record<string, boolean>>(
        {}
    );

    const toggleSection = (title: string, isOpen: boolean) => {
        setManualToggles((prev) => ({
            ...prev,
            [title]: !isOpen,
        }));
    };

    // Only care about expandedItem when isExpanded is true
    const activeExpandedItem = isExpanded ? expandedItem : null;

    return (
        <div className="mt-6 w-full px-2">
            <nav className="w-full space-y-6">
                {/* Overview - Direct link */}
                <Link
                    href={PAGES.DASHBOARD as Route}
                    className={cn(
                        "flex w-full items-center px-5 py-2 transition-all duration-300 ease-out hover:bg-neutral-800/50 group",
                        isExpanded ? "justify-start gap-2" : "justify-center"
                    )}
                    onClick={onSelect}
                >
                    <div
                        className={cn(
                            "flex items-center gap-2 transition-all duration-300 ease-out",
                            pathname === PAGES.DASHBOARD
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-foreground"
                        )}
                    >
                        <RiDashboardLine size={20} />
                        <span
                            className={cn(
                                "font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ease-out",
                                isExpanded
                                    ? "opacity-100 w-auto"
                                    : "opacity-0 w-0 overflow-hidden"
                            )}
                        >
                            Overview
                        </span>
                    </div>
                </Link>

                {sections.map((section) => {
                    const isOpen =
                        manualToggles[section.title] ??
                        section.items.some((i) => i.path === pathname);
                    return (
                        <div key={section.title} className="space-y-1">
                            {/* Section header - always rendered, uses opacity */}
                            <button
                                className={cn(
                                    "flex w-full items-center px-5 py-2 text-left transition-all duration-300 ease-out hover:bg-neutral-800/50 group",
                                    isExpanded
                                        ? "justify-between"
                                        : "justify-center"
                                )}
                                onClick={() =>
                                    toggleSection(section.title, isOpen)
                                }
                                type="button"
                            >
                                <div
                                    className={cn(
                                        "flex items-center gap-2 transition-all duration-300 ease-out",
                                        section.items.some(
                                            (i) => i.path === pathname
                                        )
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                >
                                    <section.icon size={20} />
                                    <h3
                                        className={cn(
                                            "font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ease-out",
                                            isExpanded
                                                ? "opacity-100 w-auto"
                                                : "opacity-0 w-0 overflow-hidden"
                                        )}
                                    >
                                        {section.title}
                                    </h3>
                                </div>
                                <RiArrowDownSLine
                                    className={cn(
                                        "size-3.5 text-muted-foreground transition-all duration-300 ease-out",
                                        isOpen && "rotate-180",
                                        isExpanded
                                            ? "opacity-100"
                                            : "opacity-0 w-0"
                                    )}
                                />
                            </button>
                            <div
                                className={cn(
                                    "flex flex-col gap-1 transition-all duration-300 overflow-hidden",
                                    !isOpen || !isExpanded
                                        ? "max-h-0 opacity-0"
                                        : "max-h-[500px] opacity-100"
                                )}
                            >
                                {section.items.map((item) => {
                                    const isActive = pathname === item.path;

                                    const hasRequiredRole = item.requiredRole
                                        ? session?.user.role ===
                                          item.requiredRole
                                        : true;

                                    if (!hasRequiredRole) {
                                        return null;
                                    }

                                    return (
                                        <Item
                                            isActive={isActive}
                                            isExpanded={isExpanded}
                                            isItemExpanded={
                                                activeExpandedItem === item.path
                                            }
                                            item={item as MenuLink}
                                            key={item.name}
                                            onSelect={onSelect}
                                            onToggle={(path) => {
                                                setExpandedItem(
                                                    expandedItem === path
                                                        ? null
                                                        : path
                                                );
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}
