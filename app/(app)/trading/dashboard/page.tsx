import { Suspense } from "react";
import { TradingDashboardClient } from "./page.client";

export default function TradingDashboardPage() {
    return (
        <Suspense
            fallback={
                <div className="px-6 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-32 rounded-lg bg-secondary/20" />
                        <div className="grid grid-cols-5 gap-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-24 rounded-lg bg-secondary/20"
                                />
                            ))}
                        </div>
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-8 h-80 rounded-lg bg-secondary/20" />
                            <div className="col-span-4 h-80 rounded-lg bg-secondary/20" />
                        </div>
                    </div>
                </div>
            }
        >
            <TradingDashboardClient />
        </Suspense>
    );
}
