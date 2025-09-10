"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Search,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface AssetsManagerProps {
  journalId: string;
}

export function AssetsManager({ journalId }: AssetsManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAsset, setNewAsset] = useState({
    name: "",
    symbol: "",
    type: "forex" as "forex" | "crypto" | "stocks" | "commodities"
  });

  // Queries
  const { data: assets, isLoading } = api.trading.getAssets.useQuery({ journalId });
  const utils = api.useUtils();

  // Mutations
  const createAssetMutation = api.trading.createAsset.useMutation({
    onSuccess: () => {
      utils.trading.getAssets.invalidate();
      setNewAsset({ name: "", symbol: "", type: "forex" });
      setIsCreating(false);
    },
  });

  const deleteAssetMutation = api.trading.deleteAsset.useMutation({
    onSuccess: () => {
      utils.trading.getAssets.invalidate();
    },
  });

  const handleCreateAsset = async () => {
    if (!newAsset.name.trim()) return;

    try {
      await createAssetMutation.mutateAsync({
        journalId,
        name: newAsset.name.trim(),
        symbol: newAsset.symbol.trim() || undefined,
        type: newAsset.type
      });
    } catch (error) {
      console.error("Error creating asset:", error);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (confirm("Are you sure you want to delete this asset? This action is irreversible.")) {
      try {
        await deleteAssetMutation.mutateAsync({ id: assetId });
      } catch (error) {
        console.error("Error deleting asset:", error);
      }
    }
  };

  const filteredAssets = assets?.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.symbol && asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const getTypeColor = (type: string | null) => {
    switch (type) {
      case "forex":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "crypto":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "stocks":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "commodities":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-white/10 bg-black/20">
        <CardHeader>
          <CardTitle className="text-white">Assets</CardTitle>
          <CardDescription className="text-white/60">Loading assets...</CardDescription>
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
            <CardTitle className="text-white">Assets</CardTitle>
            <CardDescription className="text-white/60">
              {assets?.length || 0} assets • Manage your trading instruments
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-white text-black hover:bg-gray-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
          />
        </div>

        {/* Create new asset form */}
        {isCreating && (
          <div className="p-4 bg-black/20 rounded-lg border border-white/10">
            <h3 className="text-white font-medium mb-4">Create New Asset</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-white/80">Name *</Label>
                <Input
                  value={newAsset.name}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="EUR/USD"
                  className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>
              <div>
                <Label className="text-white/80">Symbol</Label>
                <Input
                  value={newAsset.symbol}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, symbol: e.target.value }))}
                  placeholder="EURUSD"
                  className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>
              <div>
                <Label className="text-white/80">Type</Label>
                <Select
                  value={newAsset.type}
                  onValueChange={(value: "forex" | "crypto" | "stocks" | "commodities") => 
                    setNewAsset(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="bg-black border-white/30 text-white focus:border-white focus:ring-1 focus:ring-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="stocks">Stocks</SelectItem>
                    <SelectItem value="commodities">Commodities</SelectItem>
                  </SelectContent>
                </Select>
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
                onClick={handleCreateAsset}
                disabled={!newAsset.name.trim() || createAssetMutation.isPending}
                className="bg-white text-black hover:bg-gray-200"
              >
                {createAssetMutation.isPending ? "Creating..." : "Create Asset"}
              </Button>
            </div>
          </div>
        )}

        {/* Assets list */}
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-4 bg-black/20 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{asset.name}</h3>
                    {asset.symbol && (
                      <p className="text-white/60 text-sm truncate">{asset.symbol}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDeleteAsset(asset.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={getTypeColor(asset.type)}>
                    {(asset.type || 'unknown').toUpperCase()}
                  </Badge>
                  {asset.isActive ? (
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
              {searchTerm ? "No assets found matching your search" : "No assets found"}
            </p>
            <p className="text-white/40 text-sm">
              {searchTerm ? "Try a different search term" : "Start by creating your first asset"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
