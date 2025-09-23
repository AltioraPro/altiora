"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  Search,
  AlertTriangle
} from "lucide-react";

interface SessionsManagerProps {
  journalId: string;
}

export function SessionsManager({ journalId }: SessionsManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newSession, setNewSession] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    timezone: "UTC"
  });

  const { data: sessions, isLoading } = api.trading.getSessions.useQuery({ journalId });
  const { data: trades } = api.trading.getTrades.useQuery({ journalId });
  const utils = api.useUtils();

  const createSessionMutation = api.trading.createSession.useMutation({
    onSuccess: () => {
      utils.trading.getSessions.invalidate();
      setNewSession({ name: "", description: "", startTime: "", endTime: "", timezone: "UTC" });
      setIsCreating(false);
    },
  });

  const deleteSessionMutation = api.trading.deleteSession.useMutation({
    onSuccess: () => {
      utils.trading.getSessions.invalidate();
    },
  });

  const handleCreateSession = async () => {
    if (!newSession.name.trim()) return;

    try {
      await createSessionMutation.mutateAsync({
        journalId,
        name: newSession.name.trim(),
        description: newSession.description.trim() || undefined,
        startTime: newSession.startTime || undefined,
        endTime: newSession.endTime || undefined,
        timezone: newSession.timezone
      });
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm("Are you sure you want to delete this session? This action is irreversible.")) {
      try {
        await deleteSessionMutation.mutateAsync({ id: sessionId });
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    }
  };

  const sessionPerformances = sessions?.map(session => {
    const sessionTrades = trades?.filter(trade => trade.sessionId === session.id) || [];
    const totalPnL = sessionTrades.reduce((sum, trade) => {
      const pnl = trade.profitLossPercentage ? parseFloat(trade.profitLossPercentage) || 0 : 0;
      return sum + pnl;
    }, 0);
    
    return {
      ...session,
      totalPnL,
      tradesCount: sessionTrades.length
    };
  }) || [];

  const filteredSessions = sessionPerformances.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.description && session.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <Card className="border border-white/10 bg-black/20">
        <CardHeader>
          <CardTitle className="text-white">Sessions</CardTitle>
          <CardDescription className="text-white/60">Loading sessions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-white/10 bg-black/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Sessions</CardTitle>
            <CardDescription className="text-white/60">
              {sessions?.length || 0} sessions • Manage your trading sessions
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-white text-black hover:bg-gray-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Session
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
          />
        </div>

        {/* Create new session form */}
        {isCreating && (
          <div className="p-4 bg-black/20 rounded-lg border border-white/10">
            <h3 className="text-white font-medium mb-4">Create New Session</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-white/80">Name *</Label>
                <Input
                  value={newSession.name}
                  onChange={(e) => setNewSession(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="London Session"
                  className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSession}
                  disabled={!newSession.name.trim() || createSessionMutation.isPending}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Sessions list */}
        {filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="group relative flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                title={`Performance: ${session.totalPnL >= 0 ? '+' : ''}${session.totalPnL.toFixed(1)}% • ${session.tradesCount} trades`}
              >
                <div className="flex flex-col">
                  <span className="text-white font-medium">{session.name}</span>
                  <span className={`text-xs ${session.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {session.totalPnL >= 0 ? '+' : ''}{session.totalPnL.toFixed(1)}%
                  </span>
                </div>
                <Button
                  onClick={() => handleDeleteSession(session.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-8 w-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                
                {/* Tooltip détaillé au hover */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-black text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg">
                  <div className="text-center">
                    <div className="font-medium text-black">{session.name}</div>
                    <div className={`${session.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {session.totalPnL >= 0 ? '+' : ''}{session.totalPnL.toFixed(1)}%
                    </div>
                    <div className="text-gray-600 text-xs">
                      {session.tradesCount} trade{session.tradesCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {/* Flèche du tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">
              {searchTerm ? "No sessions found matching your search" : "No sessions found"}
            </p>
            <p className="text-white/40 text-sm">
              {searchTerm ? "Try a different search term" : "Start by creating your first session"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
