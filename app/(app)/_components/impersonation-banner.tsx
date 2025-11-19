"use client";

import { RiAdminLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth-client";

interface ImpersonationBannerProps {
    userName: string;
}

export function ImpersonationBanner({ userName }: ImpersonationBannerProps) {
    const router = useRouter();

    const stopImpersonatingMutation = useMutation({
        mutationFn: async () => {
            // Better-auth admin plugin should have stopImpersonating method
            const response = await authClient.admin.stopImpersonating();

            if (!response.data) {
                throw new Error("Failed to stop impersonating");
            }

            return response.data;
        },
        onSuccess: () => {
            router.push(PAGES.ADMIN_USERS);
            router.refresh();
        },
        onError: () => {
            // If stopImpersonating doesn't exist, try signing out and back in
            // This is a fallback - better-auth should have stopImpersonating
            console.error("Failed to stop impersonating");
        },
    });

    const handleStopImpersonating = () => {
        stopImpersonatingMutation.mutate();
    };

    return (
        <div className="flex items-center justify-center gap-3 bg-yellow-500/10 px-6 py-2.5 text-sm dark:text-yellow-400">
            <div className="flex items-center gap-2 font-medium">
                <RiAdminLine className="size-4" />
                <p>
                    Admin mode: You are viewing the application as{" "}
                    <span className="font-semibold">{userName}</span>.
                </p>
            </div>
            <button
                className="flex cursor-pointer items-center gap-1 p-1 underline underline-offset-2"
                disabled={stopImpersonatingMutation.isPending}
                onClick={handleStopImpersonating}
                type="button"
            >
                Return to admin view
            </button>
        </div>
    );
}
