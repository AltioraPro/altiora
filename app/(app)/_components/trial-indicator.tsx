"use client";

import Link from "next/link";
import { PAGES } from "@/constants/pages";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "../../../components/ui/button";

export function TrialIndicator() {
    const { isTrial, trialDaysRemaining, isLoading } = useSubscription();

    if (isLoading || !isTrial || trialDaysRemaining === null) {
        return null;
    }

    return (
        <Button
            asChild
            className="rounded-full px-3 font-normal text-neutral-400"
            size="xs"
            variant="outline"
        >
            <Link href={PAGES.SETTINGS}>
                Pro trial - {trialDaysRemaining}{" "}
                {trialDaysRemaining === 1 ? "day" : "days"} left
            </Link>
        </Button>
    );
}
