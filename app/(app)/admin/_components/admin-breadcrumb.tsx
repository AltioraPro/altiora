"use client";

import { RiPagesLine } from "@remixicon/react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PAGES } from "@/constants/pages";

export function AdminBreadcrumb() {
    const pathname = usePathname();
    const router = useRouter();

    const handlePageChange = (value: Route) => {
        router.push(value);
    };

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>Admin</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <Select
                        defaultValue={pathname}
                        onValueChange={handlePageChange}
                    >
                        <SelectTrigger
                            aria-label="Select page"
                            className="relative gap-2 py-0 ps-9"
                            id="select-page"
                        >
                            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 group-has-[select[disabled]]:opacity-50">
                                <RiPagesLine aria-hidden="true" size={16} />
                            </div>
                            <SelectValue placeholder="Select page" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={PAGES.ADMIN_USERS}>
                                Users
                            </SelectItem>
                            <SelectItem value={PAGES.ADMIN_WAITLIST}>
                                Waitlist
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}
