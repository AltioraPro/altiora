"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { orpc } from "@/orpc/client";
import { DashboardContent } from "./_components/dashboard-content";
import { JournalFilter } from "./_components/journal-filter";
import { OnboardingContent } from "./_components/onboarding";

export function DashboardPageClient() {
    const { data: journals } = useSuspenseQuery(
        orpc.trading.getJournals.queryOptions({ input: {} })
    );

    if (journals.length === 0) {
        return <OnboardingContent />;
    }

    return (
        <div>
            <JournalFilter journals={journals} />

            <DashboardContent />

            <DiscordWelcomeChecker />
        </div>
    );
}
