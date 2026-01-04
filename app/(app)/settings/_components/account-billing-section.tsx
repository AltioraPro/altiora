"use client";

import {
    RiBankCardLine,
    RiEditLine,
    RiLogoutBoxLine,
    RiUserLine,
} from "@remixicon/react";
import Image from "next/image";
import { useState } from "react";
import { EditProfileModal } from "@/app/(app)/settings/_components/edit-profile-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { RouterOutput } from "@/orpc/client";
import { signOut } from "@/server/actions/sign-out";
import { SettingsContentLayout } from "./settings-content-layout";

type GetCurrentUserResponse = RouterOutput["auth"]["getCurrentUser"];

export function AccountBillingSection({
    currentPage,
    user,
}: {
    currentPage: string | null;
    user: GetCurrentUserResponse;
}) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { addToast } = useToast();

    const handleManageBilling = async () => {
        const { error } = await authClient.subscription.billingPortal({
            locale: "en",
            referenceId: user.id,
            returnUrl: PAGES.SETTINGS,
            disableRedirect: false,
        });

        if (error) {
            addToast({
                title: "Error",
                message: error.message,
                type: "error",
            });
        }
    };

    return (
        <SettingsContentLayout
            className={cn(!currentPage && "hidden md:block")}
            title="Account Information"
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <div className="flex size-18 items-center justify-center overflow-hidden border border-white/20 from-white/10 to-white/5">
                            {user.image ? (
                                <Image
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                    height={80}
                                    src={user.image}
                                    width={80}
                                />
                            ) : (
                                <RiUserLine className="size-8 text-white/60" />
                            )}
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-medium text-lg text-white">
                            {user.name}
                        </h3>
                        <p className="text-sm text-white/60">{user.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        onClick={() => setIsEditModalOpen(true)}
                        size="sm"
                        variant="outline"
                    >
                        <RiEditLine />
                        Edit Profile
                    </Button>

                    <Button
                        onClick={() => signOut()}
                        size="sm"
                        variant="outline"
                    >
                        <RiLogoutBoxLine />
                        Sign Out
                    </Button>

                    <Button
                        onClick={handleManageBilling}
                        size="sm"
                        variant="outline"
                    >
                        <RiBankCardLine />
                        Manage Billing
                    </Button>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                userImage={user.image}
                userName={user.name}
            />
        </SettingsContentLayout>
    );
}
