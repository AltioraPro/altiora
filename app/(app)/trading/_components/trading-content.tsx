"use client";

import { Suspense } from "react";
import { TradesTable } from "@/app/(app)/trading/_components/trades-table/trades-table";
import { AssetsManager } from "@/components/trading/AssetsManager";
import { ConfirmationsManager } from "@/components/trading/confirmations-manager";
import { SessionsManager } from "@/components/trading/SessionsManager";

interface TradingContentProps {
    journalId: string;
    activeTab: "trades" | "assets" | "sessions" | "confirmations";
}

export function TradingContent({ journalId, activeTab }: TradingContentProps) {
    return (
        <Suspense
            fallback={
                <div className="py-8 text-center text-white/50">Loading...</div>
            }
        >
            {activeTab === "trades" && <TradesTable journalId={journalId} />}

            {activeTab === "assets" && <AssetsManager journalId={journalId} />}

            {activeTab === "sessions" && (
                <SessionsManager journalId={journalId} />
            )}

            {activeTab === "confirmations" && (
                <ConfirmationsManager journalId={journalId} />
            )}
        </Suspense>
    );
}
