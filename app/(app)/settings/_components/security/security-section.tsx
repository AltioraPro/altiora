import { PasskeysSection } from "../passkey/passkeys-section";
import { SettingsContentLayout } from "../settings-content-layout";
import { ActiveSessionsSection } from "./active-sessions-section";
import { DeleteAccountSection } from "./delete-account-section";
import { ResetPasswordSection } from "./reset-password-section";

export function SecuritySection() {
    return (
        <SettingsContentLayout title="Security">
            <ResetPasswordSection />
            <ActiveSessionsSection />
            <PasskeysSection />
            <DeleteAccountSection />
        </SettingsContentLayout>
    );
}
