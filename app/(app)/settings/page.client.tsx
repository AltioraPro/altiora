"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { orpc } from "@/orpc/client";
import { AccountBillingSection } from "./_components/account-billing-section";
import { ContactSection } from "./_components/contact-section";
import { IntegrationsSection } from "./_components/integrations-section";
import { PrivacySection } from "./_components/security/privacy-section";
import { SecuritySection } from "./_components/security/security-section";
import { settingsSearchParams } from "./search-params";

export function SettingsPageClient() {
    const [page] = useQueryState("page", settingsSearchParams.page);

    const { data: user } = useSuspenseQuery(
        orpc.auth.getCurrentUser.queryOptions({})
    );

    return (
        <div className="max-w-4xl px-6 py-8">
            {page === "account-billing" && <AccountBillingSection />}
            {page === "security" && <SecuritySection />}
            {page === "contact" && <ContactSection />}
            {page === "privacy" && (
                <PrivacySection initialIsPublic={user.isLeaderboardPublic} />
            )}
            {page === "integrations" && <IntegrationsSection />}
        </div>
    );
}
