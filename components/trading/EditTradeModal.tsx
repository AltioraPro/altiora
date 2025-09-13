"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface EditTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeId: string;
  onSuccess?: () => void;
}

export function EditTradeModal({ isOpen, onClose, tradeId, onSuccess }: EditTradeModalProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    tradeDate: "",
    assetId: "",
    sessionId: "",
    setupId: "",
    riskPercentage: "",
    resultPercentage: "",
    exitReason: "",
    tradingViewLink: "",
    notes: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  // Fetch trade data
  const { data: trade, isLoading: tradeLoading } = api.trading.getTradeById.useQuery(
    { id: tradeId },
    { enabled: isOpen && !!tradeId }
  );

  // Fetch related data
  // const { data: journals } = api.trading.getJournals.useQuery();
  const { data: sessions } = api.trading.getSessions.useQuery({ journalId: trade?.journalId });
  const { data: setups } = api.trading.getSetups.useQuery({ journalId: trade?.journalId });
  const { data: assets } = api.trading.getAssets.useQuery({ journalId: trade?.journalId });

  // Update form data when trade is loaded
  useEffect(() => {
    if (trade) {
      setFormData({
        tradeDate: trade.tradeDate ? new Date(trade.tradeDate).toISOString().split('T')[0] : "",
        assetId: trade.assetId || "",
        sessionId: trade.sessionId || "",
        setupId: trade.setupId || "",
        riskPercentage: trade.riskInput?.toString() || "",
        resultPercentage: trade.profitLossPercentage?.toString() || "",
        exitReason: trade.exitReason || "",
        tradingViewLink: (trade as { tradingviewLink?: string }).tradingviewLink || "",
        notes: trade.notes || ""
      });
    }
  }, [trade]);

  const updateTradeMutation = api.trading.updateTrade.useMutation({
    onSuccess: () => {
      addToast({
        type: "success",
        title: "Success",
        message: "Trade updated successfully",
      });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to update trade",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tradeDate) {
      addToast({
        type: "error",
        title: "Error",
        message: "Please fill in the trade date",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateTradeMutation.mutateAsync({
        id: tradeId,
        tradeDate: formData.tradeDate,
        assetId: formData.assetId || "",
        sessionId: formData.sessionId || "",
        setupId: formData.setupId || "",
        riskInput: formData.riskPercentage || "",
        profitLossPercentage: formData.resultPercentage || "",
        exitReason: (formData.exitReason as "TP" | "BE" | "SL" | "Manual") || "Manual",
        tradingViewLink: formData.tradingViewLink || "",
        notes: formData.notes || "",
      });
    } catch (error) {
      console.error("Error updating trade:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 bg-black/90">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Edit Trade</CardTitle>
            <CardDescription className="text-white/60">
              Update trade details and performance
            </CardDescription>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {tradeLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date */}
              <div>
                <Label htmlFor="tradeDate" className="text-white">Date *</Label>
                <Input
                  id="tradeDate"
                  type="date"
                  value={formData.tradeDate}
                  onChange={(e) => setFormData({ ...formData, tradeDate: e.target.value })}
                  className="bg-black/50 border-white/20 text-white"
                  required
                />
              </div>

              {/* Asset */}
              <div>
                <Label htmlFor="assetId" className="text-white">Asset</Label>
                <Select
                  value={formData.assetId}
                  onValueChange={(value) => setFormData({ ...formData, assetId: value })}
                >
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    {assets?.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id} className="text-white hover:bg-white/10">
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session */}
              <div>
                <Label htmlFor="sessionId" className="text-white">Session</Label>
                <Select
                  value={formData.sessionId}
                  onValueChange={(value) => setFormData({ ...formData, sessionId: value })}
                >
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue placeholder="Select a session" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    {sessions?.map((session) => (
                      <SelectItem key={session.id} value={session.id} className="text-white hover:bg-white/10">
                        {session.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Setup */}
              <div>
                <Label htmlFor="setupId" className="text-white">Setup</Label>
                <Select
                  value={formData.setupId}
                  onValueChange={(value) => setFormData({ ...formData, setupId: value })}
                >
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue placeholder="Select a setup" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    {setups?.map((setup) => (
                      <SelectItem key={setup.id} value={setup.id} className="text-white hover:bg-white/10">
                        {setup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Risk and Result */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="riskPercentage" className="text-white">Risk (%)</Label>
                  <Input
                    id="riskPercentage"
                    type="number"
                    step="0.1"
                    value={formData.riskPercentage}
                    onChange={(e) => setFormData({ ...formData, riskPercentage: e.target.value })}
                    className="bg-black/50 border-white/20 text-white"
                    placeholder="2.0"
                  />
                </div>

                <div>
                  <Label htmlFor="resultPercentage" className="text-white">Result (%) • Backtest mode</Label>
                  <Input
                    id="resultPercentage"
                    type="number"
                    step="0.1"
                    value={formData.resultPercentage}
                    onChange={(e) => setFormData({ ...formData, resultPercentage: e.target.value })}
                    className="bg-black/50 border-white/20 text-white"
                    placeholder="2.5"
                  />
                </div>
              </div>

              {/* Exit Reason */}
              <div>
                <Label htmlFor="exitReason" className="text-white">Exit reason</Label>
                <Select
                  value={formData.exitReason}
                  onValueChange={(value) => setFormData({ ...formData, exitReason: value })}
                >
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue placeholder="Select exit reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    <SelectItem value="TP" className="text-white hover:bg-white/10">TP</SelectItem>
                    <SelectItem value="SL" className="text-white hover:bg-white/10">SL</SelectItem>
                    <SelectItem value="BE" className="text-white hover:bg-white/10">BE</SelectItem>
                    <SelectItem value="Manual" className="text-white hover:bg-white/10">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* TradingView Link */}
              <div>
                <Label htmlFor="tradingViewLink" className="text-white">TradingView link (optional)</Label>
                <Input
                  id="tradingViewLink"
                  type="url"
                  value={formData.tradingViewLink}
                  onChange={(e) => setFormData({ ...formData, tradingViewLink: e.target.value })}
                  className="bg-black/50 border-white/20 text-white"
                  placeholder="https://www.tradingview.com/..."
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-white">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-black/50 border-white/20 text-white"
                  placeholder="Additional notes about this trade"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  {isLoading ? "Updating..." : "Update Trade"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
