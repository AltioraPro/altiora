"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useToast } from "@/components/ui/toast";
import { PAGES } from "@/constants/pages";
import type { UserRole } from "@/constants/roles";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/orpc/client";
import type { Item } from "../_components/filters";
import { adminUsersParsers, type SortableColumn } from "../search-params";

export function useUserTableActions(user: Item) {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const router = useRouter();

    const [{ search, sortBy, sortOrder, page, limit, role, waitlistStatus }] =
        useQueryStates(adminUsersParsers);

    // Get current user to prevent self-actions
    const { data: currentUser } = useQuery(
        orpc.auth.getCurrentUser.queryOptions({})
    );

    const queryKey = orpc.auth.listUsers.queryKey({
        input: {
            page,
            limit,
            sortBy: sortBy as SortableColumn,
            sortOrder,
            search,
            role: role === "all" ? undefined : role,
            waitlistStatus:
                waitlistStatus === "all" ? undefined : waitlistStatus,
        },
    });

    // Ban user mutation
    const banUserMutation = useMutation(
        orpc.auth.banMultipleUsers.mutationOptions({
            meta: {
                invalidateQueries: [queryKey],
            },
            onSuccess: () => {
                addToast({
                    type: "success",
                    title: "User banned",
                    message: `${user.email} has been banned successfully`,
                });
            },
            onError: () => {
                addToast({
                    type: "error",
                    title: "Failed to ban user",
                    message: `Failed to ban ${user.email}`,
                });
            },
        })
    );

    // Unban user (using authClient directly)
    const unbanUserMutation = useMutation({
        mutationFn: async () => {
            const response = await authClient.admin.unbanUser({
                userId: user.id,
            });
            if (!response.data) {
                throw new Error("Failed to unban user");
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            addToast({
                type: "success",
                title: "User unbanned",
                message: `${user.email} has been unbanned successfully`,
            });
        },
        onError: () => {
            addToast({
                type: "error",
                title: "Failed to unban user",
                message: `Failed to unban ${user.email}`,
            });
        },
    });

    // Change role mutation (using authClient directly)
    const changeRoleMutation = useMutation({
        mutationFn: async (newRole: UserRole) => {
            const response = await authClient.admin.setRole({
                userId: user.id,
                role: newRole,
            });
            if (!response.data) {
                throw new Error("Failed to change user role");
            }
            return response.data;
        },
        onSuccess: (_, newRole) => {
            queryClient.invalidateQueries({ queryKey });
            addToast({
                type: "success",
                title: "Role updated",
                message: `${user.email}'s role has been changed to ${newRole}`,
            });
        },
        onError: () => {
            addToast({
                type: "error",
                title: "Failed to change role",
                message: `Failed to change role for ${user.email}`,
            });
        },
    });

    // Impersonate user (using authClient directly)
    const impersonateMutation = useMutation({
        mutationFn: async () => {
            const response = await authClient.admin.impersonateUser({
                userId: user.id,
            });

            if (!response.data) {
                throw new Error("Failed to impersonate user");
            }

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            router.push(PAGES.DASHBOARD);
            router.refresh();
        },
        onError: () => {
            addToast({
                type: "error",
                title: "Failed to impersonate",
                message: `Failed to impersonate ${user.email}`,
            });
        },
    });

    const handleBanUser = () => {
        if (currentUser?.id === user.id) {
            addToast({
                type: "error",
                title: "Cannot ban yourself",
                message: "You cannot ban your own account",
            });
            return;
        }
        banUserMutation.mutate({ userIds: [user.id] });
    };

    const handleUnbanUser = () => {
        unbanUserMutation.mutate();
    };

    const handleChangeRole = (newRole: UserRole) => {
        if (currentUser?.id === user.id && newRole !== "admin") {
            addToast({
                type: "error",
                title: "Cannot change your own role",
                message: "You cannot change your own role",
            });
            return;
        }
        changeRoleMutation.mutate(newRole);
    };

    const handleImpersonate = () => {
        if (currentUser?.id === user.id) {
            addToast({
                type: "error",
                title: "Cannot impersonate yourself",
                message: "You cannot impersonate your own account",
            });
            return;
        }
        impersonateMutation.mutate();
    };

    return {
        handleBanUser,
        handleUnbanUser,
        handleChangeRole,
        handleImpersonate,
        isBanning: banUserMutation.isPending,
        isUnbanning: unbanUserMutation.isPending,
        isChangingRole: changeRoleMutation.isPending,
        isImpersonating: impersonateMutation.isPending,
    };
}
