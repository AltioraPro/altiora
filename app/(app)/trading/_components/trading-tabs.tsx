"use client";

import { RiAddLine, RiBarChartLine } from "@remixicon/react";

interface TradingTabsProps {
    activeTab: "trades" | "assets" | "sessions" | "setups";
    onTabChange: (tab: "trades" | "assets" | "sessions" | "setups") => void;
}

export function TradingTabs({ activeTab, onTabChange }: TradingTabsProps) {
    const tabs = [
        { id: "trades" as const, label: "Trades", icon: RiBarChartLine },
        { id: "assets" as const, label: "Assets", icon: RiAddLine },
        { id: "sessions" as const, label: "Sessions", icon: RiAddLine },
        { id: "setups" as const, label: "Confirmations", icon: RiAddLine },
    ];

    return (
        <div className="mb-8">
            <div className="flex space-x-1 rounded-xl border border-white/10 bg-black/20 p-1.5">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        className={`flex items-center space-x-2 rounded-lg px-5 py-3 font-medium text-sm transition-all duration-200 ${activeTab === id
                            ? "bg-white text-black shadow-xs"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                        key={id}
                        onClick={() => onTabChange(id)}
                        type="button"
                    >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
