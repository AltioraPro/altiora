"use client";

import {
    RiCalendarLine,
    RiCheckboxLine,
    RiDashboardLine,
    RiSettings3Line,
    RiShieldLine,
    RiStockLine,
    RiTargetLine,
    RiTrophyLine,
    RiUserLine,
} from "@remixicon/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PAGES } from "@/constants/pages";
import { USER_ROLES } from "@/constants/roles";
import { useSession } from "@/lib/auth-client";
import { Item } from "./menu-item";

export const MENU_ITEMS = {
    [PAGES.DASHBOARD]: () => <RiDashboardLine size={20} />,
    [PAGES.PROFILE]: () => <RiUserLine size={20} />,
    [PAGES.GOALS]: () => <RiTargetLine size={20} />,
    [PAGES.HABITS]: () => <RiCheckboxLine size={20} />,
    [PAGES.TRADING]: () => <RiStockLine size={20} />,
    [PAGES.TRADING_JOURNALS]: () => <RiStockLine size={20} />,
    [PAGES.TRADING_CALENDAR]: () => <RiCalendarLine size={20} />,
    [PAGES.LEADERBOARD]: () => <RiTrophyLine size={20} />,
    [PAGES.SETTINGS]: () => <RiSettings3Line size={20} />,
    [PAGES.ADMIN]: () => <RiShieldLine size={20} />,
} as const;

const items = [
    {
        path: PAGES.DASHBOARD,
        name: "Overview",
    },
    {
        path: PAGES.TRADING,
        name: "Trading",
        children: [
            { path: PAGES.TRADING_JOURNALS, name: "Journals" },
            { path: PAGES.TRADING_CALENDAR, name: "Calendar" },
        ],
    },
    {
        path: PAGES.GOALS,
        name: "Goals",
    },
    {
        path: PAGES.HABITS,
        name: "Habits",
    },

    {
        path: PAGES.LEADERBOARD,
        name: "Leaderboard",
    },
    {
        path: PAGES.PROFILE,
        name: "Profile",
    },
    {
        path: PAGES.SETTINGS,
        name: "Settings",
    },
    {
        path: PAGES.ADMIN,
        name: "Admin",
        requiredRole: USER_ROLES.ADMIN,
        children: [
            { path: PAGES.ADMIN_USERS, name: "Users" },
            { path: PAGES.ADMIN_WAITLIST, name: "Waitlist" },
        ],
    },
];

type Props = {
    onSelect?: () => void;
    isExpanded?: boolean;
};

export function MainMenu({ onSelect, isExpanded = false }: Props) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const part = pathname?.split("/")[1];
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: Reset expanded item when sidebar expands/collapses
    useEffect(() => {
        setExpandedItem(null);
    }, [isExpanded]);

    return (
        <div className="mt-6 w-full">
            <nav className="w-full">
                <div className="flex flex-col gap-2">
                    {items.map((item) => {
                        const isActive =
                            (pathname === PAGES.DASHBOARD &&
                                item.path === PAGES.DASHBOARD) ||
                            (pathname !== PAGES.DASHBOARD &&
                                item.path.startsWith(`/${part}`));

                        const hasRequiredRole = item.requiredRole
                            ? session?.user?.role === item.requiredRole
                            : true;

                        if (!hasRequiredRole) {
                            return null;
                        }

                        return (
                            <Item
                                isActive={isActive}
                                isExpanded={isExpanded}
                                isItemExpanded={expandedItem === item.path}
                                item={item}
                                key={item.path}
                                onSelect={onSelect}
                                onToggle={(path) => {
                                    setExpandedItem(
                                        expandedItem === path ? null : path
                                    );
                                }}
                            />
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
