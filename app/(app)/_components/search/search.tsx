"use client";

import {
    RiAddLine,
    RiCalendarLine,
    RiCheckboxLine,
    RiCornerUpRightLine,
    RiHomeLine,
    RiSettings3Line,
    RiShieldLine,
    RiStockLine,
    RiTargetLine,
    RiTrophyLine,
} from "@remixicon/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { PAGES } from "@/constants/pages";
import { USER_ROLES } from "@/constants/roles";
import { useSession } from "@/lib/auth-client";
import { useSearchStore } from "@/store/search";

const navigationItems = [
    {
        title: "Navigation",
        items: [
            {
                path: PAGES.DASHBOARD,
                name: "Overview",
                icon: RiHomeLine,
            },
            {
                path: PAGES.SETTINGS,
                name: "Settings",
                icon: RiSettings3Line,
            },
            {
                path: PAGES.ADMIN,
                name: "Admin",
                icon: RiShieldLine,
                requiredRole: USER_ROLES.ADMIN,
            },
            {
                path: PAGES.LEADERBOARD,
                name: "Leaderboard",
                icon: RiTrophyLine,
            },
        ],
    },
    {
        title: "Goals",
        items: [
            {
                path: PAGES.GOALS,
                name: "View goals",
                icon: RiTargetLine,
            },
            {
                path: PAGES.GOALS,
                name: "Create goal",
                icon: RiAddLine,
            },
        ],
    },
    {
        title: "Habits",
        items: [
            {
                path: PAGES.HABITS,
                name: "View habits",
                icon: RiCheckboxLine,
            },
            {
                path: PAGES.HABITS,
                name: "Create habit",
                icon: RiAddLine,
            },
        ],
    },
    {
        title: "Trading",
        items: [
            {
                path: PAGES.TRADING,
                name: "View trading",
                icon: RiStockLine,
            },
            {
                path: PAGES.TRADING,
                name: "Create trading",
                icon: RiAddLine,
            },
            {
                path: PAGES.TRADING,
                name: "Journals",
                icon: RiStockLine,
            },
            {
                path: PAGES.TRADING,
                name: "Calendar",
                icon: RiCalendarLine,
            },
        ],
    },
];

export function Search() {
    const router = useRouter();
    const { data: session } = useSession();
    const { setOpen } = useSearchStore();

    const handleSelect = (path: Route) => {
        router.push(path);
        setOpen();
    };

    return (
        <>
            <CommandInput placeholder="Search pages..." />
            <CommandList className="flex-1">
                <CommandEmpty>No results found.</CommandEmpty>
                {navigationItems.map((group) => (
                    <CommandGroup heading={group.title} key={group.title}>
                        {group.items.map((item) => {
                            if (
                                item.requiredRole &&
                                session?.user?.role !== item.requiredRole
                            ) {
                                return null;
                            }

                            return (
                                <CommandItem
                                    key={item.name}
                                    onSelect={() => handleSelect(item.path)}
                                    value={item.name}
                                >
                                    <RiCornerUpRightLine />
                                    <span>{item.name}</span>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                ))}
            </CommandList>
        </>
    );
}
