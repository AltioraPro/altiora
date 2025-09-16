"use client";

import React, { useMemo } from "react";
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
import { X } from "lucide-react";

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
    mode: "onChange", // Pour déclencher la validation en temps réel
  });

  // Mettre à jour journalId quand il change
  React.useEffect(() => {
    if (journalId) {
      form.setValue("journalId", journalId);
    }
  }, [journalId, form]);

  // Data queries - Get assets, sessions, and setups for all user's journals
  const { data: assets } = api.trading.getAssets.useQuery({ journalId: "" });
  const { data: sessions } = api.trading.getSessions.useQuery({ journalId: "" });
  const { data: setups } = api.trading.getSetups.useQuery({ journalId: "" });
  
  
  // Get journal info to access starting capital
  const { data: journal } = api.trading.getJournalById.useQuery(
    { id: journalId! }, 
    { enabled: !!journalId }
  );

  // Get current capital for percentage calculations
  const { data: capitalData } = api.trading.getCurrentCapital.useQuery(
    { journalId: journalId! }, 
    { enabled: !!journalId && !!journal?.usePercentageCalculation }
  ) as { data: { currentCapital: string | null; startingCapital: string | null } | undefined };

  // Calculate real-time conversions between amount and percentage
  const profitLossAmount = form.watch("profitLossAmount");
  const profitLossPercentage = form.watch("profitLossPercentage");
  
  const calculations = useMemo(() => {
    if (!journal?.usePercentageCalculation || !capitalData?.currentCapital) {
      return { calculatedAmount: null, calculatedPercentage: null };
    }

    const currentCapital = parseFloat(capitalData.currentCapital);
    
    if (profitLossPercentage && !profitLossAmount) {
      // Calculate amount from percentage based on current capital
      const percentage = parseFloat(profitLossPercentage);
      const amount = (percentage / 100) * currentCapital;
      return { calculatedAmount: amount.toFixed(2), calculatedPercentage: null };
    }
    
    if (profitLossAmount && !profitLossPercentage) {
      // Calculate percentage from amount based on current capital
      const amount = parseFloat(profitLossAmount);
      const percentage = (amount / currentCapital) * 100;
      return { calculatedAmount: null, calculatedPercentage: percentage.toFixed(2) };
    }
    
    return { calculatedAmount: null, calculatedPercentage: null };
  }, [profitLossAmount, profitLossPercentage, journal?.usePercentageCalculation, capitalData?.currentCapital]);

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


  const handleSubmit = async (data: CreateTradeForm) => {
    try {
      // Validation côté client pour s'assurer qu'au moins un champ de résultat est rempli
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
      
      // Fermer la modal et réinitialiser le formulaire
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
               {form.formState.errors.symbol && (
                 <p className="text-red-500 text-sm mt-1">
                   {form.formState.errors.symbol.message}
                 </p>
               )}
            </div>

            {/* Session */}
            <div>
              <Label htmlFor="sessionId" className="text-white/80">Session</Label>
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
            </div>

            {/* Setup */}
            <div>
              <Label htmlFor="setupId" className="text-white/80">Setup</Label>
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

            {/* Result - Conditional display based on journal type */}
            {journal?.usePercentageCalculation && journal?.startingCapital ? (
              // Journal avec capital : afficher les deux champs avec conversion
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
              // Journal backtest : seulement le pourcentage
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

            {/* Capital info */}
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