"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/trpc/client";

interface AdvancedFiltersProps {
journalId: string;
onFiltersChange: (filters: {
    sessions: string[];
    setups: string[];
    assets: string[];
}) => void;
className?: string;
}

export function AdvancedFilters({ journalId, onFiltersChange, className = "" }: AdvancedFiltersProps) {
const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
const [selectedSetups, setSelectedSetups] = useState<string[]>([]);
const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
const [isExpanded, setIsExpanded] = useState(false);

const { data: sessions } = api.trading.getSessions.useQuery({ journalId });
const { data: setups } = api.trading.getSetups.useQuery({ journalId });
const { data: assets } = api.trading.getAssets.useQuery({ journalId });

useEffect(() => {
    const savedFilters = localStorage.getItem(`trading-filters-${journalId}`);
    if (savedFilters) {
    try {
        const parsed = JSON.parse(savedFilters);
        setSelectedSessions(parsed.sessions || []);
        setSelectedSetups(parsed.setups || []);
        setSelectedAssets(parsed.assets || []);
    } catch (error) {
        console.error("Error loading saved filters:", error);
    }
    }
}, [journalId]);

useEffect(() => {
    const filters = {
    sessions: selectedSessions,
    setups: selectedSetups,
    assets: selectedAssets,
    };
    localStorage.setItem(`trading-filters-${journalId}`, JSON.stringify(filters));
    onFiltersChange(filters);
}, [selectedSessions, selectedSetups, selectedAssets, journalId, onFiltersChange]);

const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions(prev => 
    prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
};

const handleSetupToggle = (setupId: string) => {
    setSelectedSetups(prev => 
    prev.includes(setupId) 
        ? prev.filter(id => id !== setupId)
        : [...prev, setupId]
    );
};

const handleAssetToggle = (assetId: string) => {
    setSelectedAssets(prev => 
    prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
};

const handleSelectAll = (type: 'sessions' | 'setups' | 'assets') => {
    const data = type === 'sessions' ? sessions : type === 'setups' ? setups : assets;
    if (!data) return;

    const allIds = data.map(item => item.id);
    if (type === 'sessions') {
    setSelectedSessions(allIds);
    } else if (type === 'setups') {
    setSelectedSetups(allIds);
    } else {
    setSelectedAssets(allIds);
    }
};

const handleClearAll = (type: 'sessions' | 'setups' | 'assets') => {
    if (type === 'sessions') {
    setSelectedSessions([]);
    } else if (type === 'setups') {
    setSelectedSetups([]);
    } else {
    setSelectedAssets([]);
    }
};

const handleResetAll = () => {
    setSelectedSessions([]);
    setSelectedSetups([]);
    setSelectedAssets([]);
};

const totalFilters = selectedSessions.length + selectedSetups.length + selectedAssets.length;

return (
    <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2">
            <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline"
                size="sm"
                className={`rounded-lg transition-all duration-200 ${
                    isExpanded 
                        ? 'bg-white text-black hover:bg-white/90' 
                        : 'bg-black/50 border-white/20 text-white/70 hover:bg-white/10'
                }`}
            >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {totalFilters > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 text-xs rounded-full">
                        {totalFilters}
                    </span>
                )}
                {isExpanded ? (
                    <ChevronUp className="h-3 w-3 ml-1" />
                ) : (
                    <ChevronDown className="h-3 w-3 ml-1" />
                )}
            </Button>
            
            {totalFilters > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetAll}
                    className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                >
                    <RotateCcw className="h-3 w-3" />
                </Button>
            )}
        </div>

        {isExpanded && (
            <div className="absolute top-full left-0 mt-2 z-50 w-80">
                <div className="rounded-lg border border-white/10 bg-black/90 backdrop-blur-sm p-4 space-y-4 shadow-xl">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-white/90 font-medium text-xs">Sessions</h4>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSelectAll('sessions')}
                                className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                            >
                                All
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleClearAll('sessions')}
                                className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                            >
                                None
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {sessions?.map((session) => (
                            <div key={session.id} className="group flex items-center space-x-2 p-1.5 rounded hover:bg-white/5 transition-all duration-200">
                                <Checkbox
                                    id={`session-${session.id}`}
                                    checked={selectedSessions.includes(session.id)}
                                    onCheckedChange={() => handleSessionToggle(session.id)}
                                    className="h-4 w-4 border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black data-[state=checked]:border-white transition-all duration-200"
                                />
                                <label
                                    htmlFor={`session-${session.id}`}
                                    className="text-xs text-white/80 cursor-pointer flex-1 group-hover:text-white transition-colors duration-200"
                                >
                                    {session.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-white/90 font-medium text-xs">Setups</h4>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSelectAll('setups')}
                                className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                            >
                                All
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleClearAll('setups')}
                                className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                            >
                                None
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {setups?.map((setup) => (
                            <div key={setup.id} className="group flex items-center space-x-2 p-1.5 rounded hover:bg-white/5 transition-all duration-200">
                                <Checkbox
                                    id={`setup-${setup.id}`}
                                    checked={selectedSetups.includes(setup.id)}
                                    onCheckedChange={() => handleSetupToggle(setup.id)}
                                    className="h-4 w-4 border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black data-[state=checked]:border-white transition-all duration-200"
                                />
                                <label
                                    htmlFor={`setup-${setup.id}`}
                                    className="text-xs text-white/80 cursor-pointer flex-1 group-hover:text-white transition-colors duration-200"
                                >
                                    {setup.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-white/90 font-medium text-xs">Assets</h4>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSelectAll('assets')}
                                className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                            >
                                All
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleClearAll('assets')}
                                className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                            >
                                None
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {assets?.map((asset) => (
                            <div key={asset.id} className="group flex items-center space-x-2 p-1.5 rounded hover:bg-white/5 transition-all duration-200">
                                <Checkbox
                                    id={`asset-${asset.id}`}
                                    checked={selectedAssets.includes(asset.id)}
                                    onCheckedChange={() => handleAssetToggle(asset.id)}
                                    className="h-4 w-4 border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black data-[state=checked]:border-white transition-all duration-200"
                                />
                                <label
                                    htmlFor={`asset-${asset.id}`}
                                    className="text-xs text-white/80 cursor-pointer flex-1 group-hover:text-white transition-colors duration-200"
                                >
                                    {asset.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                {totalFilters > 0 && (
                    <div className="pt-3 border-t border-white/10">
                        <div className="flex flex-wrap gap-1.5">
                            {selectedSessions.map(sessionId => {
                                const session = sessions?.find(s => s.id === sessionId);
                                return session ? (
                                    <Badge 
                                        key={sessionId} 
                                        className="group bg-white/15 text-white border-white/30 text-xs px-2 py-0.5 hover:bg-white/20 transition-all duration-200"
                                    >
                                        <span className="text-white/70 text-xs mr-1">S:</span>
                                        {session.name}
                                        <X 
                                            className="h-3 w-3 ml-1 cursor-pointer hover:text-red-300 transition-colors duration-200" 
                                            onClick={() => handleSessionToggle(sessionId)}
                                        />
                                    </Badge>
                                ) : null;
                            })}
                            {selectedSetups.map(setupId => {
                                const setup = setups?.find(s => s.id === setupId);
                                return setup ? (
                                    <Badge 
                                        key={setupId} 
                                        className="group bg-white/15 text-white border-white/30 text-xs px-2 py-0.5 hover:bg-white/20 transition-all duration-200"
                                    >
                                        <span className="text-white/70 text-xs mr-1">St:</span>
                                        {setup.name}
                                        <X 
                                            className="h-3 w-3 ml-1 cursor-pointer hover:text-red-300 transition-colors duration-200" 
                                            onClick={() => handleSetupToggle(setupId)}
                                        />
                                    </Badge>
                                ) : null;
                            })}
                            {selectedAssets.map(assetId => {
                                const asset = assets?.find(a => a.id === assetId);
                                return asset ? (
                                    <Badge 
                                        key={assetId} 
                                        className="group bg-white/15 text-white border-white/30 text-xs px-2 py-0.5 hover:bg-white/20 transition-all duration-200"
                                    >
                                        <span className="text-white/70 text-xs mr-1">A:</span>
                                        {asset.name}
                                        <X 
                                            className="h-3 w-3 ml-1 cursor-pointer hover:text-red-300 transition-colors duration-200" 
                                            onClick={() => handleAssetToggle(assetId)}
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
