import { PasskeysSection } from "../passkey/passkeys-section";
import { SettingsContentLayout } from "../settings-content-layout";
import { ActiveSessionsSection } from "./active-sessions-section";
import { DeleteAccountSection } from "./delete-account-section";
import { ResetPasswordSection } from "./reset-password-section";

interface SecuritySectionProps {
    hasPasswordAccount: boolean;
}

export function SecuritySection({ hasPasswordAccount }: SecuritySectionProps) {
    return (
        <SettingsContentLayout title="Security">
            {hasPasswordAccount && <ResetPasswordSection />}
            <ActiveSessionsSection />
            <PasskeysSection />
            <DeleteAccountSection />
        </SettingsContentLayout>
    );
}
