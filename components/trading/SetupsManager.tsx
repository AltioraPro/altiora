"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Search,
  AlertTriangle,
  CheckCircle,
  Target,
  TrendingUp
} from "lucide-react";

interface SetupsManagerProps {
  journalId: string;
}

export function SetupsManager({ journalId }: SetupsManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newSetup, setNewSetup] = useState({
    name: "",
    description: "",
    strategy: "",
    successRate: ""
  });

  // Queries
  const { data: setups, isLoading } = api.trading.getSetups.useQuery({ journalId });
  const utils = api.useUtils();

  // Mutations
  const createSetupMutation = api.trading.createSetup.useMutation({
    onSuccess: () => {
      utils.trading.getSetups.invalidate();
      setNewSetup({ name: "", description: "", strategy: "", successRate: "" });
      setIsCreating(false);
    },
  });

  const deleteSetupMutation = api.trading.deleteSetup.useMutation({
    onSuccess: () => {
      utils.trading.getSetups.invalidate();
    },
  });

  const handleCreateSetup = async () => {
    if (!newSetup.name.trim()) return;

    try {
      await createSetupMutation.mutateAsync({
        journalId,
        name: newSetup.name.trim(),
        description: newSetup.description.trim() || undefined,
        strategy: newSetup.strategy.trim() || undefined,
        successRate: newSetup.successRate ? parseFloat(newSetup.successRate) : undefined
      });
    } catch (error) {
      console.error("Error creating setup:", error);
    }
  };

  const handleDeleteSetup = async (setupId: string) => {
    if (confirm("Are you sure you want to delete this setup? This action is irreversible.")) {
      try {
        await deleteSetupMutation.mutateAsync({ id: setupId });
      } catch (error) {
        console.error("Error deleting setup:", error);
      }
    }
  };

  const filteredSetups = setups?.filter(setup =>
    setup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (setup.description && setup.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (setup.strategy && setup.strategy.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const getSuccessRateColor = (rate: number | null) => {
    if (!rate) return "text-gray-400";
    if (rate >= 70) return "text-green-400";
    if (rate >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  if (isLoading) {
    return (
      <Card className="border border-white/10 bg-black/20">
        <CardHeader>
          <CardTitle className="text-white">Setups</CardTitle>
          <CardDescription className="text-white/60">Loading setups...</CardDescription>
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
            <CardTitle className="text-white">Setups</CardTitle>
            <CardDescription className="text-white/60">
              {setups?.length || 0} setups • Manage your trading strategies
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-white text-black hover:bg-gray-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Setup
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            placeholder="Search setups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
          />
        </div>

        {/* Create new setup form */}
        {isCreating && (
          <div className="p-4 bg-black/20 rounded-lg border border-white/10">
            <h3 className="text-white font-medium mb-4">Create New Setup</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Name *</Label>
                  <Input
                    value={newSetup.name}
                    onChange={(e) => setNewSetup(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Breakout Strategy"
                    className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                  />
                </div>
                <div>
                  <Label className="text-white/80">Success Rate (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newSetup.successRate}
                    onChange={(e) => setNewSetup(prev => ({ ...prev, successRate: e.target.value }))}
                    placeholder="65.5"
                    className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white/80">Strategy</Label>
                <Input
                  value={newSetup.strategy}
                  onChange={(e) => setNewSetup(prev => ({ ...prev, strategy: e.target.value }))}
                  placeholder="Brief description of the strategy..."
                  className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>
              <div>
                <Label className="text-white/80">Description</Label>
                <Textarea
                  value={newSetup.description}
                  onChange={(e) => setNewSetup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of this trading setup..."
                  className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-4">
              <Button
                onClick={() => setIsCreating(false)}
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSetup}
                disabled={!newSetup.name.trim() || createSetupMutation.isPending}
                className="bg-white text-black hover:bg-gray-200"
              >
                {createSetupMutation.isPending ? "Creating..." : "Create Setup"}
              </Button>
            </div>
          </div>
        )}

        {/* Setups list */}
        {filteredSetups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSetups.map((setup) => (
              <div
                key={setup.id}
                className="p-4 bg-black/20 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{setup.name}</h3>
                    {setup.strategy && (
                      <p className="text-white/60 text-sm mt-1 truncate">{setup.strategy}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDeleteSetup(setup.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {setup.description && (
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">{setup.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {setup.successRate && (
                      <div className="flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1 text-white/60" />
                        <span className={`text-sm font-medium ${getSuccessRateColor(setup.successRate)}`}>
                          {setup.successRate}%
                        </span>
                      </div>
                    )}
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <Target className="w-3 h-3 mr-1" />
                      Strategy
                    </Badge>
                  </div>
                  
                  {setup.isActive ? (
                    <div className="flex items-center text-green-400 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-400 text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Inactive
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">
              {searchTerm ? "No setups found matching your search" : "No setups found"}
            </p>
            <p className="text-white/40 text-sm">
              {searchTerm ? "Try a different search term" : "Start by creating your first setup"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
