"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/trpc/client";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { BarChart3, ArrowLeft, ChevronDown } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { GlobalTradingStats } from "@/components/trading/GlobalTradingStats";
import { GlobalTradingCharts } from "@/components/trading/GlobalTradingCharts";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";

export default function GlobalDashboardPage() {
  useSession();
  const [selectedJournalIds, setSelectedJournalIds] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: journals, isLoading: journalsLoading } = api.trading.getJournals.useQuery();

  const effectiveJournalIds = selectedJournalIds.length > 0 ? selectedJournalIds : undefined;

  const { data: stats } = api.trading.getStats.useQuery({ 
    journalIds: effectiveJournalIds 
  });
  const { data: allTrades } = api.trading.getTrades.useQuery({ 
    journalIds: effectiveJournalIds
  });

  const { data: sessions } = api.trading.getSessions.useQuery({ 
    journalIds: effectiveJournalIds 
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleJournalToggle = (journalId: string) => {
    if (selectedJournalIds.includes(journalId)) {
      setSelectedJournalIds(selectedJournalIds.filter(id => id !== journalId));
    } else {
      setSelectedJournalIds([...selectedJournalIds, journalId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedJournalIds.length === 0) {
      setSelectedJournalIds(journals?.map(j => j.id) || []);
    } else {
      setSelectedJournalIds([]);
    }
  };

  if (journalsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!journals || journals.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-argesta text-white mb-4 font-bold">Global Dashboard</h1>
            <p className="text-white/60">Create your first journal to see global statistics.</p>
          </div>

          <Card className="p-8 border border-white/10 bg-black/20">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-8 h-8 text-white/60" />
          </div>
            <h3 className="text-xl text-white mb-4">No journals</h3>
            <p className="text-white/60 mb-8">Create a journal to start tracking your performance.</p>

            <Link href="/trading/journals">
              <Button className="bg-white text-black hover:bg-gray-200">
                Create Journal
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <Link className="text-pure-black" href="/trading/journals">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Journals
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-argesta text-white font-bold">Global Dashboard</h1>
            <p className="text-white/60">Overview of all your statistics. Select a journal to filter.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-64 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 border border-white/20 bg-black/20 text-white rounded-md hover:bg-black/30 transition-colors"
            >
              <span>
                {selectedJournalIds.length === 0 && "All journals"}
                {selectedJournalIds.length === 1 && journals?.find(j => j.id === selectedJournalIds[0])?.name}
                {selectedJournalIds.length > 1 && `${selectedJournalIds.length} journals selected`}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/20 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="p-2">
                  <div
                    onClick={handleSelectAll}
                    className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedJournalIds.length === journals?.length}
                      className="bg-black/50 border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <span className="text-white">All journals</span>
                  </div>
                  
                  {journals?.map((journal) => (
                    <div
                      key={journal.id}
                      onClick={() => handleJournalToggle(journal.id)}
                      className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedJournalIds.includes(journal.id)}
                        className="bg-black/50 border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                      />
                      <span className="text-white">{journal.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {selectedJournalIds.length > 0 && (
            <div className="text-white/60 text-sm">
              {selectedJournalIds.length} journal{selectedJournalIds.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      </div>


      {/* Stats */}
      {stats && (
        <div className="mb-8">
          <GlobalTradingStats stats={stats} />
        </div>
      )}


      {/* Charts */}
      {stats && sessions && allTrades && (
        <div className="mb-8">
          <Card className="border border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-white">Performance Charts</CardTitle>
              <CardDescription className="text-white/60">Visual analysis of your overall performance</CardDescription>
            </CardHeader>
            <CardContent>
              <GlobalTradingCharts sessions={sessions} trades={allTrades} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trade creation/import modals removed on global dashboard */}
      
      <DiscordWelcomeChecker />
    </div>
  );
}
 