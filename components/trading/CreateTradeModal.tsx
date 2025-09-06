"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";

const createTradeSchema = z.object({
  tradeDate: z.string().min(1, "Date is required"),
  symbol: z.string().min(1, "Asset is required"),
  sessionId: z.string().optional(),
  setupId: z.string().optional(),
  riskInput: z.string().optional(),
  profitLossAmount: z.string().optional(),
  profitLossPercentage: z.string().optional(),
  exitReason: z.enum(["TP", "BE", "SL", "Manual"]).optional(),
  tradingviewLink: z.string().optional(),
  notes: z.string().optional(),
  journalId: z.string().min(1, "Journal is required"),
});

type CreateTradeForm = z.infer<typeof createTradeSchema>;

interface CreateTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalId?: string;
}

export function CreateTradeModal({ isOpen, onClose, journalId }: CreateTradeModalProps) {
  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [showNewSetupForm, setShowNewSetupForm] = useState(false);
  
  const utils = api.useUtils();
  
  // Forms for new elements
  const [newAsset, setNewAsset] = useState({ name: "", symbol: "", type: "forex" as const });
  const [newSession, setNewSession] = useState({ name: "", description: "" });
  const [newSetup, setNewSetup] = useState({ name: "", description: "", strategy: "" });

  const form = useForm<CreateTradeForm>({
    resolver: zodResolver(createTradeSchema),
    defaultValues: {
      tradeDate: new Date().toISOString().split('T')[0],
      symbol: "",
      riskInput: "",
      profitLossAmount: "",
      profitLossPercentage: "",
      tradingviewLink: "",
      notes: "",
      journalId: journalId || "",
    },
  });

  // Data queries - Get assets, sessions, and setups for all user's journals
  const { data: assets, refetch: refetchAssets } = api.trading.getAssets.useQuery({ journalId: "" });
  const { data: sessions, refetch: refetchSessions } = api.trading.getSessions.useQuery({ journalId: "" });
  const { data: setups, refetch: refetchSetups } = api.trading.getSetups.useQuery({ journalId: "" });
  
  // Get journal info to access starting capital
  const { data: journal } = api.trading.getJournalById.useQuery(
    { id: journalId! }, 
    { enabled: !!journalId }
  );

  // Calculate real-time conversions between amount and percentage
  const profitLossAmount = form.watch("profitLossAmount");
  const profitLossPercentage = form.watch("profitLossPercentage");
  
  const calculations = useMemo(() => {
    if (!journal?.usePercentageCalculation || !journal?.startingCapital) {
      return { calculatedAmount: null, calculatedPercentage: null };
    }

    const startingCapital = parseFloat(journal.startingCapital);
    
    if (profitLossPercentage && !profitLossAmount) {
      // Calculate amount from percentage
      const percentage = parseFloat(profitLossPercentage);
      const amount = (percentage / 100) * startingCapital;
      return { calculatedAmount: amount.toFixed(2), calculatedPercentage: null };
    }
    
    if (profitLossAmount && !profitLossPercentage) {
      // Calculate percentage from amount
      const amount = parseFloat(profitLossAmount);
      const percentage = (amount / startingCapital) * 100;
      return { calculatedAmount: null, calculatedPercentage: percentage.toFixed(2) };
    }
    
    return { calculatedAmount: null, calculatedPercentage: null };
  }, [profitLossAmount, profitLossPercentage, journal?.usePercentageCalculation, journal?.startingCapital]);

  // Mutations
  const createTradeMutation = api.trading.createTrade.useMutation({
    onSuccess: () => {
      form.reset();
      onClose();
      // Invalidate queries to refresh data
      utils.trading.getTrades.invalidate();
      utils.trading.getStats.invalidate();
    },
  });

  const createAssetMutation = api.trading.createAsset.useMutation({
    onSuccess: () => {
      setNewAsset({ name: "", symbol: "", type: "forex" });
      setShowNewAssetForm(false);
      refetchAssets();
    },
  });

  const createSessionMutation = api.trading.createSession.useMutation({
    onSuccess: () => {
      setNewSession({ name: "", description: "" });
      setShowNewSessionForm(false);
      refetchSessions();
    },
  });

  const createSetupMutation = api.trading.createSetup.useMutation({
    onSuccess: () => {
      setNewSetup({ name: "", description: "", strategy: "" });
      setShowNewSetupForm(false);
      refetchSetups();
    },
  });

  const handleSubmit = async (data: CreateTradeForm) => {
    try {
      console.log("=== TRADE CREATION START ===");
      console.log("Form data:", data);
      console.log("JournalId:", journalId);
      console.log("Form valid:", form.formState.isValid);
      console.log("Form errors:", form.formState.errors);
      
             const tradeData = {
         ...data,
         tradeDate: data.tradeDate,
         journalId: journalId!,
         isClosed: true,
       };
      
      console.log("Data sent to mutation:", tradeData);
      
      const result = await createTradeMutation.mutateAsync(tradeData);
      console.log("Trade created successfully:", result);
    } catch (error) {
      console.error("=== TRADE CREATION ERROR ===");
      console.error("Complete error:", error);
      console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
      console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    }
  };

  const handleCreateAsset = async () => {
    if (newAsset.name && newAsset.symbol && journal?.id) {
      try {
        await createAssetMutation.mutateAsync({
          journalId: journal.id,
          name: newAsset.name,
          symbol: newAsset.symbol,
          type: newAsset.type,
        });
        setNewAsset({ name: "", symbol: "", type: "forex" });
        setShowNewAssetForm(false);
      } catch (error) {
        console.error("Error creating asset:", error);
      }
    }
  };

  const handleCreateSession = async () => {
    if (newSession.name && journal?.id) {
      try {
        await createSessionMutation.mutateAsync({
          journalId: journal.id,
          name: newSession.name,
          description: newSession.description,
        });
        setNewSession({ name: "", description: "" });
        setShowNewSessionForm(false);
      } catch (error) {
        console.error("Error creating session:", error);
      }
    }
  };

  const handleCreateSetup = async () => {
    if (newSetup.name && journal?.id) {
      try {
        await createSetupMutation.mutateAsync({
          journalId: journal.id,
          name: newSetup.name,
          description: newSetup.description,
          strategy: newSetup.strategy,
        });
        setNewSetup({ name: "", description: "", strategy: "" });
        setShowNewSetupForm(false);
      } catch (error) {
        console.error("Error creating setup:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20 bg-black">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-argesta text-white">New Trade</CardTitle>
              <CardDescription className="text-white/70">
                Add a new trade to your journal
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-white">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Date */}
            <div>
              <Label htmlFor="tradeDate" className="text-white/80">Date</Label>
                <Input
                  id="tradeDate"
                  type="date"
                  {...form.register("tradeDate")}
                  className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                />
              {form.formState.errors.tradeDate && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.tradeDate.message}
                </p>
              )}
            </div>

                         {/* Asset */}
             <div>
               <Label htmlFor="symbol" className="text-white/80">Asset</Label>
               <div className="flex gap-2">
                 <Select
                   value={form.watch("symbol")}
                   onValueChange={(value) => form.setValue("symbol", value)}
                 >
                 <SelectTrigger className="flex-1 bg-black border-white/30 text-white focus:border-white focus:ring-1 focus:ring-white">
                   <SelectValue placeholder="Select an asset" />
                 </SelectTrigger>
                   <SelectContent>
                     {assets?.map((asset) => (
                       <SelectItem key={asset.id} value={asset.symbol}>
                         {asset.name} ({asset.symbol})
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 
                 <Button
                   type="button"
                   variant="outline"
                   size="sm"
                   onClick={() => setShowNewAssetForm(!showNewAssetForm)}
                   className="border-white/30 text-white hover:bg-white hover:text-black transition-colors"
                 >
                   <Plus className="h-4 w-4" />
                 </Button>
               </div>
               
               {showNewAssetForm && (
                <div className="mt-2 p-3 border border-white/20 rounded-lg bg-black/30">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Asset name"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                      className="bg-black/30 border-white/20 text-white placeholder:text-white/40"
                    />
                    <Input
                      placeholder="Symbol"
                      value={newAsset.symbol}
                      onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
                      className="bg-black/30 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2 bg-white text-black hover:bg-gray-200"
                    onClick={handleCreateAsset}
                    disabled={createAssetMutation.isPending}
                  >
                    {createAssetMutation.isPending ? "Creating..." : "Create asset"}
                  </Button>
                </div>
              )}
              {form.formState.errors.symbol && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.symbol.message}
                </p>
              )}
            </div>

            {/* Session */}
            <div>
              <Label htmlFor="sessionId" className="text-white/80">Session</Label>
              <div className="flex gap-2">
                <Select
                  value={form.watch("sessionId") || ""}
                  onValueChange={(value) => form.setValue("sessionId", value)}
                >
                  <SelectTrigger className="flex-1 bg-black/30 border-white/20 text-white">
                                         <SelectValue placeholder="Select a session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions?.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewSessionForm(!showNewSessionForm)}
                  className="border-white/20 text-white/80 hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showNewSessionForm && (
                <div className="mt-2 p-3 border border-white/20 rounded-lg bg-black/30">
                  <Input
                    placeholder="Session name"
                    value={newSession.name}
                    onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                    className="mb-2 bg-black/30 border-white/20 text-white placeholder:text-white/40"
                  />
                  <Textarea
                    placeholder="Description"
                    value={newSession.description}
                    onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                    rows={2}
                    className="bg-black/30 border-white/20 text-white placeholder:text-white/40"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2 bg-white text-black hover:bg-gray-200"
                    onClick={handleCreateSession}
                    disabled={createSessionMutation.isPending}
                  >
                    {createSessionMutation.isPending ? "Creating..." : "Create session"}
                  </Button>
                </div>
              )}
            </div>

            {/* Setup */}
            <div>
              <Label htmlFor="setupId" className="text-white/80">Setup</Label>
              <div className="flex gap-2">
                <Select
                  value={form.watch("setupId") || ""}
                  onValueChange={(value) => form.setValue("setupId", value)}
                >
                  <SelectTrigger className="flex-1 bg-black/30 border-white/20 text-white">
                                         <SelectValue placeholder="Select a setup" />
                  </SelectTrigger>
                  <SelectContent>
                    {setups?.map((setup) => (
                      <SelectItem key={setup.id} value={setup.id}>
                        {setup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewSetupForm(!showNewSetupForm)}
                  className="border-white/20 text-white/80 hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showNewSetupForm && (
                <div className="mt-2 p-3 border border-white/20 rounded-lg bg-black/30">
                  <Input
                    placeholder="Setup name"
                    value={newSetup.name}
                    onChange={(e) => setNewSetup({ ...newSetup, name: e.target.value })}
                    className="mb-2 bg-black/30 border-white/20 text-white placeholder:text-white/40"
                  />
                  <Textarea
                    placeholder="Description"
                    value={newSetup.description}
                    onChange={(e) => setNewSetup({ ...newSetup, description: e.target.value })}
                    rows={2}
                    className="mb-2 bg-black/30 border-white/20 text-white placeholder:text-white/40"
                  />
                  <Input
                    placeholder="Strategy"
                    value={newSetup.strategy}
                    onChange={(e) => setNewSetup({ ...newSetup, strategy: e.target.value })}
                    className="bg-black/30 border-white/20 text-white placeholder:text-white/40"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2 bg-white text-black hover:bg-gray-200"
                    onClick={handleCreateSetup}
                    disabled={createSetupMutation.isPending}
                  >
                    {createSetupMutation.isPending ? "Creating..." : "Create setup"}
                  </Button>
                </div>
              )}
            </div>

            {/* Risk */}
            <div>
              <Label htmlFor="riskInput" className="text-white/80">Risk (%)</Label>
              <Input
                id="riskInput"
                {...form.register("riskInput")}
                placeholder="2.0"
                className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
              />
              {form.formState.errors.riskInput && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.riskInput.message}
                </p>
              )}
            </div>

            {/* Result - Amount or Percentage */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profitLossAmount" className="text-white/80">
                  Résultat (€)
                  {calculations.calculatedAmount && (
                    <span className="text-white/60 font-normal ml-2">
                      = {calculations.calculatedAmount}€
                    </span>
                  )}
                </Label>
                <Input
                  id="profitLossAmount"
                  {...form.register("profitLossAmount")}
                  placeholder="250.00"
                  type="number"
                  step="0.01"
                  className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                />
                {form.formState.errors.profitLossAmount && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.profitLossAmount.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="profitLossPercentage" className="text-white/80">
                  Résultat (%)
                  {calculations.calculatedPercentage && (
                    <span className="text-white/60 font-normal ml-2">
                      = {calculations.calculatedPercentage}%
                    </span>
                  )}
                </Label>
                <Input
                  id="profitLossPercentage"
                  {...form.register("profitLossPercentage")}
                  placeholder="2.5"
                  type="number"
                  step="0.01"
                  className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                />
                {form.formState.errors.profitLossPercentage && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.profitLossPercentage.message}
                  </p>
                )}
              </div>
            </div>

            {/* Capital info */}
            {journal?.usePercentageCalculation && journal?.startingCapital && (
              <div className="text-xs text-white/50 bg-black/20 p-2 rounded border border-white/10">
                💰 Capital de départ: {journal.startingCapital}€
              </div>
            )}

            {/* Exit reason */}
            <div>
              <Label htmlFor="exitReason" className="text-white/80">Exit reason</Label>
              <Select
                value={form.watch("exitReason") || ""}
                onValueChange={(value) => form.setValue("exitReason", value as "TP" | "BE" | "SL" | "Manual")}
              >
                <SelectTrigger className="bg-black border-white/30 text-white focus:border-white focus:ring-1 focus:ring-white">
                  <SelectValue placeholder="Select exit reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TP">🎯 TP (Take Profit)</SelectItem>
                  <SelectItem value="BE">⚖️ BE (Break Even)</SelectItem>
                  <SelectItem value="SL">🛑 SL (Stop Loss)</SelectItem>
                  <SelectItem value="Manual">✋ Manual</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.exitReason && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.exitReason.message}
                </p>
              )}
            </div>

            {/* TradingView link */}
            <div>
              <Label htmlFor="tradingviewLink" className="text-white/80">TradingView link (optional)</Label>
              <Input
                id="tradingviewLink"
                {...form.register("tradingviewLink")}
                placeholder="https://www.tradingview.com/..."
                className="bg-black/30 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-white/80">Notes (optional)</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Trade notes..."
                rows={3}
                className="bg-black/30 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="border-white/20 text-white/80 hover:bg-white/10">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTradeMutation.isPending}
                className="bg-white text-black hover:bg-gray-200"
              >
                {createTradeMutation.isPending ? "Creating..." : "Create trade"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 