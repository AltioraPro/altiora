"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  AlertCircle,
  Crown,
  Trophy,
  Star,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Sparkles
} from "lucide-react";

const rankIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  NEW: Target,
  BEGINNER: Target,
  RISING: TrendingUp,
  CHAMPION: Trophy,
  EXPERT: Star,
  LEGEND: Crown,
  MASTER: Zap,
  GRANDMASTER: Shield,
  IMMORTAL: Sparkles,
};

export function DiscordConnection() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: connectionStatus, refetch } = api.discord.getConnectionStatus.useQuery();
  const { data: botStatus } = api.discord.checkBotStatus.useQuery();
  const disconnectMutation = api.discord.disconnect.useMutation();
  const syncRankMutation = api.discord.syncRank.useMutation();
  const autoSyncRankMutation = api.discord.autoSyncRank.useMutation();
  const getAuthUrlMutation = api.discord.getAuthUrl.useMutation();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { authUrl } = await getAuthUrlMutation.mutateAsync();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      await refetch();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleSyncRank = async () => {
    setIsSyncing(true);
    try {
      await syncRankMutation.mutateAsync();
      await refetch();
    } catch (error) {
      console.error('Failed to sync rank:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAutoSyncRank = async () => {
    setIsSyncing(true);
    try {
      await autoSyncRankMutation.mutateAsync();
      await refetch();
    } catch (error) {
      console.error('Failed to auto sync rank:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const RankIcon = connectionStatus?.currentRank && rankIcons[connectionStatus.currentRank] 
    ? rankIcons[connectionStatus.currentRank] 
    : Target;

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <MessageCircle className="w-5 h-5" />
          <span>DISCORD INTEGRATION</span>
        </CardTitle>
        <CardDescription className="text-white/60">
          Connect your Discord account to automatically sync your rank
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {connectionStatus?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Connected</span>
              </div>
              <Badge variant="outline" className="text-white/60">
                {connectionStatus.username}#{connectionStatus.discriminator}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {connectionStatus.roleSynced ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                )}
                <span className={connectionStatus.roleSynced ? "text-green-400" : "text-yellow-400"}>
                  {connectionStatus.roleSynced ? "Role synced" : "Role not synced"}
                </span>
              </div>
              
              {connectionStatus.currentRank && (
                <div className="flex items-center space-x-2">
                  <RankIcon className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/60">{connectionStatus.currentRank}</span>
                </div>
              )}
            </div>

            {connectionStatus.lastSync && (
              <div className="text-xs text-white/40">
                Last sync: {new Date(connectionStatus.lastSync).toLocaleString('en-US')}
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={handleSyncRank}
                disabled={isSyncing}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </Button>
              
              <Button
                onClick={handleAutoSyncRank}
                disabled={isSyncing || !botStatus?.online}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Auto Sync</span>
              </Button>
              
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-red-400 border-red-400/20 hover:bg-red-400/10"
              >
                <XCircle className="w-4 h-4" />
                <span>Disconnect</span>
              </Button>
            </div>

            <div className="pt-2 border-t border-white/10">
              <a
                href="https://discord.gg/altiora"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Join the Discord server</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-white/40" />
              <span className="text-white/40">Not connected</span>
            </div>
            
            <div className="text-sm text-white/60 space-y-2">
              <p>Connect your Discord account to:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span>Automatically sync your rank</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span>Access exclusive roles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span>Participate in the community</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {isConnecting ? "Connecting..." : "Connect with Discord"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
