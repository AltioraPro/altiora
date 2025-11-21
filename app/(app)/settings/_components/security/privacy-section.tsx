"use client";

import { LeaderboardVisibility } from "@/components/settings/LeaderboardVisibility";
import { SettingsContentLayout } from "../settings-content-layout";

interface PrivacySectionProps {
    initialIsPublic: boolean;
}

export function PrivacySection({ initialIsPublic }: PrivacySectionProps) {
    return (
        <SettingsContentLayout title="Privacy">
            <LeaderboardVisibility initialIsPublic={initialIsPublic} />
        </SettingsContentLayout>
    );
}
