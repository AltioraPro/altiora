"use client";

import type { QueryClient } from "@tanstack/react-query";
import type { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth-client";

export async function impersonateUser(
    userId: string,
    queryClient: QueryClient,
    router: ReturnType<typeof useRouter>
) {
    const { error } = await authClient.admin.impersonateUser({
        userId,
    });

    if (error) {
        if (error.code === AUTH_ERRORS.BANNED_USER) {
            toast.error(`Failed to impersonate user: ${error.message}`);
        } else {
            toast.error("Failed to impersonate user");
        }
        return;
    }

    queryClient.invalidateQueries({
        queryKey: ["user"],
    });
    router.push(PAGES.DASHBOARD);
    router.refresh();
}
