"use client";

import type { QueryClient } from "@tanstack/react-query";
import type { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { AUTH_ERRORS } from "@/constants/auth-errors";
import { PAGES } from "@/constants/pages";
import { authClient } from "@/lib/auth-client";

export async function impersonateUser(
    userId: string,
    queryClient: QueryClient,
    router: ReturnType<typeof useRouter>
) {
    const { addToast } = useToast();

    const { error } = await authClient.admin.impersonateUser({
        userId,
    });

    if (error) {
        if (error.code === AUTH_ERRORS.BANNED_USER) {
            addToast({
                type: "error",
                title: "Failed to impersonate user",
                message: `${error.message}`,
            });
        } else {
            addToast({
                type: "error",
                title: "Failed to impersonate user",
                message: "Failed to impersonate user",
            });
        }
        return;
    }

    queryClient.invalidateQueries({
        queryKey: ["user"],
    });
    router.push(PAGES.DASHBOARD);
    router.refresh();
}
