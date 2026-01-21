"use client";

import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { DashboardContent } from "./_components/dashboard-content";

export function DashboardPageClient() {
    return (
        <div className="px-6 py-8">
            <DashboardContent />
            <DiscordWelcomeChecker />
        </div>
    );
}
