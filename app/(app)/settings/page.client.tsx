"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { orpc } from "@/orpc/client";
import { AccountBillingSection } from "./_components/account-billing-section";
import { ContactSection } from "./_components/contact-section";
import { IntegrationsSection } from "./_components/integrations-section";
import { MobileSettingsMenu } from "./_components/mobile-settings-menu";
import { PrivacySection } from "./_components/security/privacy-section";
import { SecuritySection } from "./_components/security/security-section";
import { settingsSearchParams } from "./search-params";

export function SettingsPageClient() {
    const [page] = useQueryState("page", settingsSearchParams.page);

    const { data: user } = useSuspenseQuery(
        orpc.auth.getCurrentUser.queryOptions()
    );

    return (
        <div className="max-w-4xl px-6 py-8">
            {!page && (
                <>
                    <MobileSettingsMenu />
                    <AccountBillingSection currentPage={page} user={user} />
                </>
            )}
            {page === "account-billing" && (
                <AccountBillingSection currentPage={page} user={user} />
            )}
            {page === "security" && (
                <SecuritySection hasPasswordAccount={user.hasPasswordAccount} />
            )}
            {page === "contact" && <ContactSection />}
            {page === "privacy" && (
                <PrivacySection initialIsPublic={user.isLeaderboardPublic} />
            )}
            {page === "integrations" && <IntegrationsSection />}
        </div>
    );
}
