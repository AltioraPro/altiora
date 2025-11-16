"use client";

import {
    Calendar,
    CheckSquare,
    Home,
    Settings2,
    Shield,
    Target,
    TrendingUp,
    Trophy,
    User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PAGES } from "@/constants/pages";
import { USER_ROLES } from "@/constants/roles";
import { useSession } from "@/lib/auth-client";
import { Item } from "./menu-item";

export const MENU_ITEMS = {
    [PAGES.DASHBOARD]: () => <Home size={20} />,
    [PAGES.PROFILE]: () => <User size={20} />,
    [PAGES.GOALS]: () => <Target size={20} />,
    [PAGES.HABITS]: () => <CheckSquare size={20} />,
    [PAGES.TRADING]: () => <TrendingUp size={20} />,
    [PAGES.TRADING_JOURNALS]: () => <TrendingUp size={20} />,
    [PAGES.TRADING_CALENDAR]: () => <Calendar size={20} />,
    [PAGES.LEADERBOARD]: () => <Trophy size={20} />,
    [PAGES.SETTINGS]: () => <Settings2 size={20} />,
    [PAGES.ADMIN]: () => <Shield size={20} />,
} as const;

const items = [
    {
        path: PAGES.DASHBOARD,
        name: "Overview",
    },
    {
        path: PAGES.PROFILE,
        name: "Profile",
    },
    {
        path: PAGES.GOALS,
        name: "Goals",
    },
    {
        path: PAGES.HABITS,
        name: "Habits",
        // children: [
        //     { path: "/invoices/products", name: "Products" },
        //     { path: "/invoices?type=create", name: "Create new" },
        // ],
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
        path: PAGES.LEADERBOARD,
        name: "Leaderboard",
    },
    {
        path: PAGES.SETTINGS,
        name: "Settings",
    },
    {
        path: PAGES.ADMIN,
        name: "Admin",
        requiredRole: USER_ROLES.ADMIN,
        // children: [
        //     { path: PAGES.ADMIN_USERS, name: "Users" },
        //     { path: PAGES.ADMIN_WAITLIST, name: "Waitlist" },
        // ],
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
