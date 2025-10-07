"use client";

import React, { useMemo, useState } from "react";
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
  const utils = api.useUtils();
  const [showQuickCreate, setShowQuickCreate] = useState<{
    asset: boolean;
    session: boolean;
    setup: boolean;
  }>({ asset: false, session: false, setup: false });

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
    mode: "onChange", 
  });

  React.useEffect(() => {
    if (journalId) {
      form.setValue("journalId", journalId);
    }
  }, [journalId, form]);

  const { data: assets } = api.trading.getAssets.useQuery({ journalId: journalId || "" });
  const { data: sessions } = api.trading.getSessions.useQuery({ journalId: journalId || "" });
  const { data: setups } = api.trading.getSetups.useQuery({ journalId: journalId || "" });
  
  
  const { data: journal } = api.trading.getJournalById.useQuery(
    { id: journalId! }, 
    { enabled: !!journalId }
  );

  const { data: capitalData } = api.trading.getCurrentCapital.useQuery(
    { journalId: journalId! }, 
    { enabled: !!journalId && !!journal?.usePercentageCalculation }
  ) as { data: { currentCapital: string | null; startingCapital: string | null } | undefined };

  const profitLossAmount = form.watch("profitLossAmount");
  const profitLossPercentage = form.watch("profitLossPercentage");
  
  const calculations = useMemo(() => {
    if (!journal?.usePercentageCalculation || !capitalData?.currentCapital) {
      return { calculatedAmount: null, calculatedPercentage: null };
    }

    const currentCapital = parseFloat(capitalData.currentCapital);
    
    if (profitLossPercentage && !profitLossAmount) {
      const percentage = parseFloat(profitLossPercentage);
      const amount = (percentage / 100) * currentCapital;
      return { calculatedAmount: amount.toFixed(2), calculatedPercentage: null };
    }
    
    if (profitLossAmount && !profitLossPercentage) {
      const amount = parseFloat(profitLossAmount);
      const percentage = (amount / currentCapital) * 100;
      return { calculatedAmount: null, calculatedPercentage: percentage.toFixed(2) };
    }
    
    return { calculatedAmount: null, calculatedPercentage: null };
  }, [profitLossAmount, profitLossPercentage, journal?.usePercentageCalculation, capitalData?.currentCapital]);

  const createTradeMutation = api.trading.createTrade.useMutation({
    onSuccess: () => {
      form.reset();
      onClose();
      utils.trading.getTrades.invalidate();
      utils.trading.getStats.invalidate();
    },
  });

  // Quick create mutations
  const createAssetMutation = api.trading.createAsset.useMutation({
    onSuccess: () => {
      utils.trading.getAssets.invalidate();
      setShowQuickCreate(prev => ({ ...prev, asset: false }));
    },
  });

  const createSessionMutation = api.trading.createSession.useMutation({
    onSuccess: () => {
      utils.trading.getSessions.invalidate();
      setShowQuickCreate(prev => ({ ...prev, session: false }));
    },
  });

  const createSetupMutation = api.trading.createSetup.useMutation({
    onSuccess: () => {
      utils.trading.getSetups.invalidate();
      setShowQuickCreate(prev => ({ ...prev, setup: false }));
    },
  });


  // Quick create handlers
  const handleQuickCreateAsset = async (name: string, symbol: string) => {
    if (!journalId || !name.trim() || !symbol.trim()) return;
    
    try {
      const newAsset = await createAssetMutation.mutateAsync({
        journalId,
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
      });
      
      // Auto-select the newly created asset
      form.setValue("symbol", newAsset.symbol);
    } catch (error) {
      console.error("Error creating asset:", error);
    }
  };

  const handleQuickCreateSession = async (name: string) => {
    if (!journalId || !name.trim()) return;
    
    try {
      const newSession = await createSessionMutation.mutateAsync({
        journalId,
        name: name.trim(),
        timezone: "UTC"
      });
      
      // Auto-select the newly created session
      form.setValue("sessionId", newSession.id);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleQuickCreateSetup = async (name: string) => {
    if (!journalId || !name.trim()) return;
    
    try {
      const newSetup = await createSetupMutation.mutateAsync({
        journalId,
        name: name.trim(),
      });
      
      // Auto-select the newly created setup
      form.setValue("setupId", newSetup.id);
    } catch (error) {
      console.error("Error creating setup:", error);
    }
  };

  const handleSubmit = async (data: CreateTradeForm) => {
    try {
      if (!data.profitLossAmount && !data.profitLossPercentage) {
        alert("Please provide either amount or percentage");
        return;
      }
      
      const tradeData = {
        ...data,
        tradeDate: data.tradeDate,
        journalId: journalId!,
        isClosed: true,
      };
      
      await createTradeMutation.mutateAsync(tradeData);
      
      onClose();
      form.reset();
    } catch (error) {
      console.error("Error creating trade:", error);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20 bg-black">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className=" text-white">New Trade</CardTitle>
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

             <div>
               <div className="flex items-center justify-between mb-2">
                 <Label htmlFor="symbol" className="text-white/80">Asset</Label>
                 <Button
                   type="button"
                   variant="ghost"
                   size="sm"
                   onClick={() => setShowQuickCreate(prev => ({ ...prev, asset: !prev.asset }))}
                   className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
                 >
                   <Plus className="w-3 h-3 mr-1" />
                   Quick create
                 </Button>
               </div>
               
               {showQuickCreate.asset ? (
                 <QuickCreateAsset
                   onCreate={handleQuickCreateAsset}
                   onCancel={() => setShowQuickCreate(prev => ({ ...prev, asset: false }))}
                   isLoading={createAssetMutation.isPending}
                 />
               ) : (
                 <Select
                   value={form.watch("symbol")}
                   onValueChange={(value) => form.setValue("symbol", value)}
                 >
                   <SelectTrigger className="bg-black border-white/30 text-white focus:border-white focus:ring-1 focus:ring-white">
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
               )}
               
               {form.formState.errors.symbol && (
                 <p className="text-red-500 text-sm mt-1">
                   {form.formState.errors.symbol.message}
                 </p>
               )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="sessionId" className="text-white/80">Session</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickCreate(prev => ({ ...prev, session: !prev.session }))}
                  className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Quick create
                </Button>
              </div>
              
              {showQuickCreate.session ? (
                <QuickCreateSession
                  onCreate={handleQuickCreateSession}
                  onCancel={() => setShowQuickCreate(prev => ({ ...prev, session: false }))}
                  isLoading={createSessionMutation.isPending}
                />
              ) : (
                <Select
                  value={form.watch("sessionId") || ""}
                  onValueChange={(value) => form.setValue("sessionId", value)}
                >
                  <SelectTrigger className="bg-black/30 border-white/20 text-white">
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
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="setupId" className="text-white/80">Setup</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickCreate(prev => ({ ...prev, setup: !prev.setup }))}
                  className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Quick create
                </Button>
              </div>
              
              {showQuickCreate.setup ? (
                <QuickCreateSetup
                  onCreate={handleQuickCreateSetup}
                  onCancel={() => setShowQuickCreate(prev => ({ ...prev, setup: false }))}
                  isLoading={createSetupMutation.isPending}
                />
              ) : (
                <Select
                  value={form.watch("setupId") || ""}
                  onValueChange={(value) => form.setValue("setupId", value)}
                >
                  <SelectTrigger className="bg-black/30 border-white/20 text-white">
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
              )}
            </div>

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

            {journal?.usePercentageCalculation && journal?.startingCapital ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profitLossAmount" className="text-white/80">
                    Result (€)
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
                    Result (%)
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
            ) : (
              <div>
                <Label htmlFor="profitLossPercentage" className="text-white/80">
                  Result (%)
                  <span className="text-white/40 text-sm ml-2">• Backtest mode</span>
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
                <p className="text-xs text-white/50 mt-1">
                  No need for euro amounts in this journal
                </p>
              </div>
            )}

            {journal?.usePercentageCalculation && capitalData && (
              <div className="text-xs text-white/50 bg-black/20 p-2 rounded border border-white/10">
                Current capital: {capitalData.currentCapital}€
                {capitalData.startingCapital && (
                  <span className="text-white/40 ml-2">
                    (Started with: {capitalData.startingCapital}€)
                  </span>
                )}
              </div>
            )}

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
                  <SelectItem value="TP">TP (Take Profit)</SelectItem>
                  <SelectItem value="BE">BE (Break Even)</SelectItem>
                  <SelectItem value="SL">SL (Stop Loss)</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.exitReason && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.exitReason.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tradingviewLink" className="text-white/80">TradingView link (optional)</Label>
              <Input
                id="tradingviewLink"
                {...form.register("tradingviewLink")}
                placeholder="https://www.tradingview.com/..."
                className="bg-black/30 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
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

// Quick Create Components
interface QuickCreateAssetProps {
  onCreate: (name: string, symbol: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function QuickCreateAsset({ onCreate, onCancel, isLoading }: QuickCreateAssetProps) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");

  const handleSubmit = () => {
    if (name.trim() && symbol.trim()) {
      onCreate(name, symbol);
      setName("");
      setSymbol("");
    }
  };

  return (
    <div className="space-y-3 p-3 bg-black/20 rounded-lg border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">Create new asset</span>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-6 w-6 p-0 text-white/60">
          <X className="w-3 h-3" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Asset name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-xs bg-black/40 border-white/15 text-white placeholder:text-white/50"
        />
        <Input
          placeholder="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="h-8 text-xs bg-black/40 border-white/15 text-white placeholder:text-white/50"
        />
      </div>
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !name.trim() || !symbol.trim()}
        size="sm"
        className="h-7 w-full text-xs bg-white/20 hover:bg-white/30 text-white"
      >
        {isLoading ? "Creating..." : "Create"}
      </Button>
    </div>
  );
}

interface QuickCreateSessionProps {
  onCreate: (name: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function QuickCreateSession({ onCreate, onCancel, isLoading }: QuickCreateSessionProps) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      onCreate(name);
      setName("");
    }
  };

  return (
    <div className="space-y-3 p-3 bg-black/20 rounded-lg border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">Create new session</span>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-6 w-6 p-0 text-white/60">
          <X className="w-3 h-3" />
        </Button>
      </div>
      <Input
        placeholder="Session name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-8 text-xs bg-black/40 border-white/15 text-white placeholder:text-white/50"
      />
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !name.trim()}
        size="sm"
        className="h-7 w-full text-xs bg-white/20 hover:bg-white/30 text-white"
      >
        {isLoading ? "Creating..." : "Create"}
      </Button>
    </div>
  );
}

interface QuickCreateSetupProps {
  onCreate: (name: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function QuickCreateSetup({ onCreate, onCancel, isLoading }: QuickCreateSetupProps) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      onCreate(name);
      setName("");
    }
  };

  return (
    <div className="space-y-3 p-3 bg-black/20 rounded-lg border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">Create new setup</span>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-6 w-6 p-0 text-white/60">
          <X className="w-3 h-3" />
        </Button>
      </div>
      <Input
        placeholder="Setup name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-8 text-xs bg-black/40 border-white/15 text-white placeholder:text-white/50"
      />
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !name.trim()}
        size="sm"
        className="h-7 w-full text-xs bg-white/20 hover:bg-white/30 text-white"
      >
        {isLoading ? "Creating..." : "Create"}
      </Button>
    </div>
  );
} 