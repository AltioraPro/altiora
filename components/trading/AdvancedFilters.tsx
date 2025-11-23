"use client";

import {
    RiArrowDownSLine,
    RiArrowUpSLine,
    RiFilterLine,
    RiRefreshLine,
    RiXingLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { orpc } from "@/orpc/client";

interface AdvancedFiltersProps {
    journalId: string;
    onFiltersChange: (filters: {
        sessions: string[];
        confirmations: string[];
        assets: string[];
    }) => void;
    className?: string;
}

export function AdvancedFilters({
    journalId,
    onFiltersChange,
    className = "",
}: AdvancedFiltersProps) {
    const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
    const [selectedConfirmations, setSelectedConfirmations] = useState<
        string[]
    >([]);
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    const { data: sessions } = useQuery(
        orpc.trading.getSessions.queryOptions({ input: { journalId } })
    );
    const { data: confirmations } = useQuery(
        orpc.trading.getConfirmations.queryOptions({ input: { journalId } })
    );
    const { data: assets } = useQuery(
        orpc.trading.getAssets.queryOptions({ input: { journalId } })
    );

    useEffect(() => {
        const savedFilters = localStorage.getItem(
            `trading-filters-${journalId}`
        );
        if (savedFilters) {
            try {
                const parsed = JSON.parse(savedFilters);
                setSelectedSessions(parsed.sessions || []);
                setSelectedConfirmations(parsed.confirmations || []);
                setSelectedAssets(parsed.assets || []);
            } catch (error) {
                console.error("Error loading saved filters:", error);
            }
        }
    }, [journalId]);

    useEffect(() => {
        const filters = {
            sessions: selectedSessions,
            confirmations: selectedConfirmations,
            assets: selectedAssets,
        };
        localStorage.setItem(
            `trading-filters-${journalId}`,
            JSON.stringify(filters)
        );
        onFiltersChange(filters);
    }, [
        selectedSessions,
        selectedConfirmations,
        selectedAssets,
        journalId,
        onFiltersChange,
    ]);

    const handleSessionToggle = (sessionId: string) => {
        setSelectedSessions((prev) =>
            prev.includes(sessionId)
                ? prev.filter((id) => id !== sessionId)
                : [...prev, sessionId]
        );
    };

    const handleConfirmationToggle = (confirmationId: string) => {
        setSelectedConfirmations((prev) =>
            prev.includes(confirmationId)
                ? prev.filter((id) => id !== confirmationId)
                : [...prev, confirmationId]
        );
    };

    const handleAssetToggle = (assetId: string) => {
        setSelectedAssets((prev) =>
            prev.includes(assetId)
                ? prev.filter((id) => id !== assetId)
                : [...prev, assetId]
        );
    };

    const handleSelectAll = (type: "sessions" | "confirmations" | "assets") => {
        if (type === "sessions") {
            setSelectedSessions(sessions?.map((item) => item.id) || []);
        } else if (type === "confirmations") {
            setSelectedConfirmations(
                confirmations?.map((item) => item.id) || []
            );
        } else {
            setSelectedAssets(assets?.map((item) => item.id) || []);
        }
    };

    const handleClearAll = (type: "sessions" | "confirmations" | "assets") => {
        if (type === "sessions") {
            setSelectedSessions([]);
        } else if (type === "confirmations") {
            setSelectedConfirmations([]);
        } else {
            setSelectedAssets([]);
        }
    };

    const handleResetAll = () => {
        setSelectedSessions([]);
        setSelectedConfirmations([]);
        setSelectedAssets([]);
    };

    const totalFilters =
        selectedSessions.length +
        selectedConfirmations.length +
        selectedAssets.length;

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center space-x-2">
                <Button
                    className={`h-8 border-white/15 bg-black/40 px-3 text-white/80 transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white ${
                        isExpanded
                            ? "border-white/25 bg-white/15 text-white"
                            : ""
                    }`}
                    onClick={() => setIsExpanded(!isExpanded)}
                    size="sm"
                    variant="outline"
                >
                    <RiFilterLine className="mr-1.5 h-3 w-3" />
                    <span className="font-medium text-xs">Filters</span>
                    {totalFilters > 0 && (
                        <span className="ml-1.5 rounded-full bg-white/25 px-1.5 py-0.5 text-white text-xs">
                            {totalFilters}
                        </span>
                    )}
                    {isExpanded ? (
                        <RiArrowUpSLine className="ml-1 h-3 w-3" />
                    ) : (
                        <RiArrowDownSLine className="ml-1 h-3 w-3" />
                    )}
                </Button>

                {totalFilters > 0 && (
                    <Button
                        className="h-8 w-8 rounded-md p-0 text-white/60 hover:bg-white/10 hover:text-white"
                        onClick={handleResetAll}
                        size="sm"
                        variant="ghost"
                    >
                        <RiRefreshLine className="h-3 w-3" />
                    </Button>
                )}
            </div>

            {isExpanded && (
                <div className="absolute top-full left-0 z-50 mt-2 w-80">
                    <div className="space-y-4 rounded-lg border border-white/10 bg-black/90 p-4 shadow-xl backdrop-blur-xs">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-white/90 text-xs">
                                    Sessions
                                </h4>
                                <div className="flex gap-1">
                                    <Button
                                        className="h-6 px-2 text-white/60 text-xs transition-all duration-200 hover:bg-white/10 hover:text-white"
                                        onClick={() =>
                                            handleSelectAll("sessions")
                                        }
                                        size="sm"
                                        variant="ghost"
                                    >
                                        All
                                    </Button>
                                    <Button
                                        className="h-6 px-2 text-white/60 text-xs transition-all duration-200 hover:bg-white/10 hover:text-white"
                                        onClick={() =>
                                            handleClearAll("sessions")
                                        }
                                        size="sm"
                                        variant="ghost"
                                    >
                                        None
                                    </Button>
                                </div>
                            </div>
                            <div className="scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-h-24 space-y-1 overflow-y-auto">
                                {sessions?.map((session) => (
                                    <div
                                        className="group flex items-center space-x-2 rounded p-1.5 transition-all duration-200 hover:bg-white/5"
                                        key={session.id}
                                    >
                                        <Checkbox
                                            checked={selectedSessions.includes(
                                                session.id
                                            )}
                                            className="h-4 w-4 border-white/30 transition-all duration-200 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                                            id={`session-${session.id}`}
                                            onCheckedChange={() =>
                                                handleSessionToggle(session.id)
                                            }
                                        />
                                        <label
                                            className="flex-1 cursor-pointer text-white/80 text-xs transition-colors duration-200 group-hover:text-white"
                                            htmlFor={`session-${session.id}`}
                                        >
                                            {session.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-white/90 text-xs">
                                    Confirmations
                                </h4>
                                <div className="flex gap-1">
                                    <Button
                                        className="h-6 px-2 text-white/60 text-xs transition-all duration-200 hover:bg-white/10 hover:text-white"
                                        onClick={() =>
                                            handleSelectAll("confirmations")
                                        }
                                        size="sm"
                                        variant="ghost"
                                    >
                                        All
                                    </Button>
                                    <Button
                                        className="h-6 px-2 text-white/60 text-xs transition-all duration-200 hover:bg-white/10 hover:text-white"
                                        onClick={() =>
                                            handleClearAll("confirmations")
                                        }
                                        size="sm"
                                        variant="ghost"
                                    >
                                        None
                                    </Button>
                                </div>
                            </div>
                            <div className="scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-h-24 space-y-1 overflow-y-auto">
                                {confirmations?.map((confirmation) => (
                                    <div
                                        className="group flex items-center space-x-2 rounded p-1.5 transition-all duration-200 hover:bg-white/5"
                                        key={confirmation.id}
                                    >
                                        <Checkbox
                                            checked={selectedConfirmations.includes(
                                                confirmation.id
                                            )}
                                            className="h-4 w-4 border-white/30 transition-all duration-200 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                                            id={`confirmation-${confirmation.id}`}
                                            onCheckedChange={() =>
                                                handleConfirmationToggle(
                                                    confirmation.id
                                                )
                                            }
                                        />
                                        <label
                                            className="flex-1 cursor-pointer text-white/80 text-xs transition-colors duration-200 group-hover:text-white"
                                            htmlFor={`confirmation-${confirmation.id}`}
                                        >
                                            {confirmation.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-white/90 text-xs">
                                    Assets
                                </h4>
                                <div className="flex gap-1">
                                    <Button
                                        className="h-6 px-2 text-white/60 text-xs transition-all duration-200 hover:bg-white/10 hover:text-white"
                                        onClick={() =>
                                            handleSelectAll("assets")
                                        }
                                        size="sm"
                                        variant="ghost"
                                    >
                                        All
                                    </Button>
                                    <Button
                                        className="h-6 px-2 text-white/60 text-xs transition-all duration-200 hover:bg-white/10 hover:text-white"
                                        onClick={() => handleClearAll("assets")}
                                        size="sm"
                                        variant="ghost"
                                    >
                                        None
                                    </Button>
                                </div>
                            </div>
                            <div className="scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-h-24 space-y-1 overflow-y-auto">
                                {assets?.map((asset) => (
                                    <div
                                        className="group flex items-center space-x-2 rounded p-1.5 transition-all duration-200 hover:bg-white/5"
                                        key={asset.id}
                                    >
                                        <Checkbox
                                            checked={selectedAssets.includes(
                                                asset.id
                                            )}
                                            className="h-4 w-4 border-white/30 transition-all duration-200 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                                            id={`asset-${asset.id}`}
                                            onCheckedChange={() =>
                                                handleAssetToggle(asset.id)
                                            }
                                        />
                                        <label
                                            className="flex-1 cursor-pointer text-white/80 text-xs transition-colors duration-200 group-hover:text-white"
                                            htmlFor={`asset-${asset.id}`}
                                        >
                                            {asset.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {totalFilters > 0 && (
                            <div className="border-white/10 border-t pt-3">
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedSessions.map((sessionId) => {
                                        const session = sessions?.find(
                                            (s) => s.id === sessionId
                                        );
                                        return session ? (
                                            <Badge
                                                className="group border-white/30 bg-white/15 px-2 py-0.5 text-white text-xs transition-all duration-200 hover:bg-white/20"
                                                key={sessionId}
                                            >
                                                <span className="mr-1 text-white/70 text-xs">
                                                    S:
                                                </span>
                                                {session.name}
                                                <RiXingLine
                                                    className="ml-1 h-3 w-3 cursor-pointer transition-colors duration-200 hover:text-red-300"
                                                    onClick={() =>
                                                        handleSessionToggle(
                                                            sessionId
                                                        )
                                                    }
                                                />
                                            </Badge>
                                        ) : null;
                                    })}
                                    {selectedConfirmations.map(
                                        (confirmationId) => {
                                            const confirmation =
                                                confirmations?.find(
                                                    (c) =>
                                                        c.id === confirmationId
                                                );
                                            return confirmation ? (
                                                <Badge
                                                    className="group border-white/30 bg-white/15 px-2 py-0.5 text-white text-xs transition-all duration-200 hover:bg-white/20"
                                                    key={confirmationId}
                                                >
                                                    <span className="mr-1 text-white/70 text-xs">
                                                        C:
                                                    </span>
                                                    {confirmation.name}
                                                    <RiXingLine
                                                        className="ml-1 h-3 w-3 cursor-pointer transition-colors duration-200 hover:text-red-300"
                                                        onClick={() =>
                                                            handleConfirmationToggle(
                                                                confirmationId
                                                            )
                                                        }
                                                    />
                                                </Badge>
                                            ) : null;
                                        }
                                    )}
                                    {selectedAssets.map((assetId) => {
                                        const asset = assets?.find(
                                            (a) => a.id === assetId
                                        );
                                        return asset ? (
                                            <Badge
                                                className="group border-white/30 bg-white/15 px-2 py-0.5 text-white text-xs transition-all duration-200 hover:bg-white/20"
                                                key={assetId}
                                            >
                                                <span className="mr-1 text-white/70 text-xs">
                                                    A:
                                                </span>
                                                {asset.name}
                                                <RiXingLine
                                                    className="ml-1 size-3 cursor-pointer transition-colors duration-200 hover:text-red-300"
                                                    onClick={() =>
                                                        handleAssetToggle(
                                                            assetId
                                                        )
                                                    }
                                                />
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
