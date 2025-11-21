import {
    RiDashboardLine,
    RiLogoutBoxLine,
    RiSettingsLine,
    RiShieldCheckLine,
    RiUserLine,
} from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { PAGES } from "@/constants/pages";
import { USER_ROLES } from "@/constants/roles";
import type { User } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function DropdownUser({ user }: { user: User }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
                {user.image ? (
                    <Image
                        alt={user.name}
                        className="size-6 rounded-full"
                        height={32}
                        src={user.image}
                        width={32}
                    />
                ) : (
                    <div className="flex size-8 items-center justify-center rounded-full bg-neutral-700">
                        {user.name.charAt(0)}
                    </div>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" sideOffset={16}>
                <div className="flex w-full flex-col p-2 pb-1 text-sm">
                    <p className="truncate font-medium text-primary">
                        {user.name}
                    </p>
                    <p className="truncate text-muted-foreground">
                        {user.email}
                    </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.DASHBOARD}>
                            <RiDashboardLine className="size-4" />
                            Dashboard
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.PROFILE}>
                            <RiUserLine className="size-4" />
                            Profile
                        </Link>
                    </DropdownMenuItem>
                    {user.role === USER_ROLES.ADMIN && (
                        <DropdownMenuItem asChild>
                            <Link href={PAGES.ADMIN_USERS}>
                                <RiShieldCheckLine className="size-4" />
                                Admin
                            </Link>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={PAGES.SETTINGS}>
                        <RiSettingsLine className="size-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                    <LogoutButton className="flex h-full w-full items-center gap-2">
                        <RiLogoutBoxLine className="text-destructive" />
                        Sign Out
                    </LogoutButton>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
