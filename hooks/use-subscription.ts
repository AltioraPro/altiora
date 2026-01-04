"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getTrialDaysLeft } from "@/lib/trial";

type Subscription = Awaited<
    ReturnType<typeof authClient.subscription.list>
>["data"];
type SubscriptionItem = NonNullable<Subscription>[number];

export function useSubscription() {
    const { data: subscriptions, isLoading } = useQuery({
        queryKey: ["subscriptions"],
        queryFn: async () => {
            const result = await authClient.subscription.list();
            return result.data ?? [];
        },
        staleTime: 1000 * 60 * 5,
    });

    const activeSubscription = subscriptions?.find(
        (sub: SubscriptionItem) =>
            sub.status === "active" || sub.status === "trialing"
    );

    const isTrial = activeSubscription?.status === "trialing";

    const trialDaysRemaining = isTrial
        ? getTrialDaysLeft(activeSubscription?.trialStart?.toISOString() ?? "")
        : null;

    const hasAccess = activeSubscription?.status === "active" || isTrial;

    return {
        subscription: activeSubscription,
        subscriptions,
        isLoading,
        hasAccess,
        isTrial,
        trialDaysRemaining,
        status: activeSubscription?.status ?? "expired",
    };
}
