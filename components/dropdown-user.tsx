import {
    LayoutDashboard,
    LogOut,
    Settings,
    ShieldCheck,
    User2,
    User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { PAGES } from "@/constants/pages";
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
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm text-white/80 hover:border-white/40 hover:bg-white/5 hover:text-white">
                <div className="flex size-6 items-center justify-center rounded-full bg-white/10">
                    <UserIcon className="size-3" />
                </div>
                {user.name.split(" ")[0]}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
                            <LayoutDashboard className="size-4" />
                            Dashboard
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.PROFILE}>
                            <User2 className="size-4" />
                            Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.ADMIN}>
                            <ShieldCheck className="size-4" />
                            Admin
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={PAGES.SETTINGS}>
                        <Settings className="size-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                    <LogoutButton className="flex h-full w-full items-center gap-2">
                        <LogOut className="text-destructive" />
                        Sign Out
                    </LogoutButton>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
