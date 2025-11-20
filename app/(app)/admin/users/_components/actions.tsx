"use client";

import {
    RiMailLine,
    RiMoreLine,
    RiUserFill,
    RiUserForbidLine,
    RiUserSettingsLine,
    RiUserStarLine,
    RiUserUnfollowLine,
} from "@remixicon/react";
import type { Row } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_ROLES } from "@/constants/roles";
import { useUserTableActions } from "../_hooks/use-user-table-actions";
import type { Item } from "./filters";

export default function RowActions({ row }: { row: Row<Item> }) {
    const user = row.original;
    const {
        handleBanUser,
        handleUnbanUser,
        handleChangeRole,
        handleImpersonate,
        isBanning,
        isUnbanning,
        isChangingRole,
        isImpersonating,
    } = useUserTableActions(user);

    const [showBanDialog, setShowBanDialog] = useState(false);
    const [showUnbanDialog, setShowUnbanDialog] = useState(false);

    const onConfirmBan = () => {
        handleBanUser();
        setShowBanDialog(false);
    };

    const onConfirmUnban = () => {
        handleUnbanUser();
        setShowUnbanDialog(false);
    };

    const isLoading =
        isBanning || isUnbanning || isChangingRole || isImpersonating;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        aria-label="Open menu"
                        className="h-8 w-8 p-0"
                        disabled={isLoading}
                        variant="ghost"
                    >
                        <RiMoreLine className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={() => {
                            navigator.clipboard.writeText(user.email);
                        }}
                    >
                        <RiMailLine className="h-4 w-4" />
                        Copy email
                    </DropdownMenuItem>

                    {!user.banned && (
                        <>
                            <DropdownMenuItem onClick={handleImpersonate}>
                                <RiUserStarLine className="h-4 w-4" />
                                Impersonate user
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <RiUserSettingsLine className="h-4 w-4" />
                                    Change role
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem
                                        disabled={
                                            user.role === USER_ROLES.ADMIN
                                        }
                                        onClick={() =>
                                            handleChangeRole(USER_ROLES.ADMIN)
                                        }
                                    >
                                        <RiUserFill className="h-4 w-4" />
                                        Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        disabled={user.role === USER_ROLES.USER}
                                        onClick={() =>
                                            handleChangeRole(USER_ROLES.USER)
                                        }
                                    >
                                        <RiUserFill className="h-4 w-4" />
                                        User
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </>
                    )}

                    <DropdownMenuSeparator />

                    {/* Ban/Unban actions */}
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                            user.banned
                                ? setShowUnbanDialog(true)
                                : setShowBanDialog(true)
                        }
                        variant="destructive"
                    >
                        {user.banned ? (
                            <>
                                <RiUserUnfollowLine className="h-4 w-4" />
                                Unban user
                            </>
                        ) : (
                            <>
                                <RiUserForbidLine className="h-4 w-4" />
                                Ban user
                            </>
                        )}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Ban Confirmation Dialog */}
            <Dialog onOpenChange={setShowBanDialog} open={showBanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ban user</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to ban{" "}
                            <span className="font-semibold">{user.email}</span>?
                            This action will prevent them from accessing the
                            platform.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => setShowBanDialog(false)}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isBanning}
                            onClick={onConfirmBan}
                            variant="destructive"
                        >
                            {isBanning ? "Banning..." : "Ban user"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unban Confirmation Dialog */}
            <Dialog onOpenChange={setShowUnbanDialog} open={showUnbanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unban user</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to unban{" "}
                            <span className="font-semibold">{user.email}</span>?
                            This will restore their access to the platform.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => setShowUnbanDialog(false)}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button disabled={isUnbanning} onClick={onConfirmUnban}>
                            {isUnbanning ? "Unbanning..." : "Unban user"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
