import { Suspense } from "react";
import { DiscordConnection } from "@/app/(app)/profile/_components/discord-connection";
import { CTraderConnection } from "./ctrader-connection";
import { SettingsContentLayout } from "./settings-content-layout";

export function IntegrationsSection() {
    return (
        <SettingsContentLayout title="Integrations">
            {/* cTrader Card */}
            <div className="border border-white/10 bg-black/20">
                <Suspense
                    fallback={
                        <div className="h-32 animate-pulse rounded-lg bg-white/5" />
                    }
                >
                    <CTraderConnection />
                </Suspense>
            </div>

            {/* Discord Card */}
            <div className="border border-white/10 bg-black/20">
                <Suspense
                    fallback={
                        <div className="h-32 animate-pulse rounded-lg bg-white/5" />
                    }
                >
                    <DiscordConnection />
                </Suspense>
            </div>
        </SettingsContentLayout>
    );
}
