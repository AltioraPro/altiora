"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PAGES } from "@/constants/pages";

const tabs = [
    { value: "users", label: "Users", href: PAGES.ADMIN },
    { value: "waitlist", label: "Waitlist", href: PAGES.ADMIN_WAITLIST },
];

export function AdminNavTabs() {
    const pathname = usePathname();

    const activeTab = pathname === PAGES.ADMIN_WAITLIST ? "waitlist" : "users";

    return (
        <Tabs className="mb-6" value={activeTab}>
            <TabsList variant="line">
                {tabs.map((tab) => (
                    <TabsTrigger
                        asChild
                        key={tab.value}
                        value={tab.value}
                        variant="line"
                    >
                        <Link href={tab.href}>{tab.label}</Link>
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
