import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/orpc/client";

export type BadgeColor =
    | "gray"
    | "blue"
    | "purple"
    | "orange"
    | "yellow"
    | "sky"
    | "red"
    | "green"
    | "pink"
    | "teal";

export function useUserData() {
    const {
        data: user,
        isLoading,
        error,
        refetch,
    } = useQuery(
        orpc.auth.getCurrentUser.queryOptions({
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
        })
    );

    return {
        user,
        isLoading,
        error,
        refetch,
    };
}
