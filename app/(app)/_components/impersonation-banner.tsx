"use client";

import { RiAdminLine } from "@remixicon/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { stopImpersonating } from "@/app/(app)/_lib/stop-impersonating";

interface ImpersonationBannerProps {
    userName: string;
}

export function ImpersonationBanner({ userName }: ImpersonationBannerProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const handleStopImpersonation = () => {
        stopImpersonating(queryClient, router);
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
                onClick={handleStopImpersonation}
                type="button"
            >
                Return to admin view
            </button>
        </div>
    );
}
