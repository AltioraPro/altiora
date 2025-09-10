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

  // Queries
  const { data: sessions, isLoading } = api.trading.getSessions.useQuery({ journalId });
  const utils = api.useUtils();

  // Mutations
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

  const filteredSessions = sessions?.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.description && session.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

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
          <div className="space-y-2">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
              >
                <span className="text-white font-medium">{session.name}</span>
                <Button
                  onClick={() => handleDeleteSession(session.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-8 w-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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
