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
            <div className="space-y-4">
              <div>
                <Label className="text-white/80">Name *</Label>
                <Input
                  value={newAsset.name}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="EUR/USD"
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
                  onClick={handleCreateAsset}
                  disabled={!newAsset.name.trim() || createAssetMutation.isPending}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  {createAssetMutation.isPending ? "Creating..." : "Create Asset"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Assets list */}
        {filteredAssets.length > 0 ? (
          <div className="space-y-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
              >
                <span className="text-white font-medium">{asset.name}</span>
                <Button
                  onClick={() => handleDeleteAsset(asset.id)}
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
