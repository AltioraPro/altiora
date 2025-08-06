"use client";

import { useState } from "react";
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
  tradeDate: z.string().min(1, "La date est requise"),
  symbol: z.string().min(1, "L'actif est requis"),
  sessionId: z.string().optional(),
  setupId: z.string().optional(),
  riskInput: z.string().optional(),
  profitLossPercentage: z.string().optional(),
  exitReason: z.enum(["TP", "BE", "SL", "Manual"]).optional(),
  tradingviewLink: z.string().optional(),
  notes: z.string().optional(),
  journalId: z.string().min(1, "Le journal est requis"),
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
  
  // Formulaires pour les nouveaux éléments
  const [newAsset, setNewAsset] = useState({ name: "", symbol: "", type: "forex" as const });
  const [newSession, setNewSession] = useState({ name: "", description: "" });
  const [newSetup, setNewSetup] = useState({ name: "", description: "", strategy: "" });

  const form = useForm<CreateTradeForm>({
    resolver: zodResolver(createTradeSchema),
    defaultValues: {
      tradeDate: new Date().toISOString().split('T')[0],
      symbol: "",
      riskInput: "",
      profitLossPercentage: "",
      tradingviewLink: "",
      notes: "",
      journalId: journalId || "",
    },
  });

  // Queries pour les données
  const { data: assets, refetch: refetchAssets } = api.trading.getAssets.useQuery({ journalId });
  const { data: sessions, refetch: refetchSessions } = api.trading.getSessions.useQuery({ journalId });
  const { data: setups, refetch: refetchSetups } = api.trading.getSetups.useQuery({ journalId });

  // Mutations
  const createTradeMutation = api.trading.createTrade.useMutation({
    onSuccess: () => {
      form.reset();
      onClose();
      // Invalider les queries pour rafraîchir les données
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
      console.log("=== DÉBUT CRÉATION TRADE ===");
      console.log("Données du formulaire:", data);
      console.log("JournalId:", journalId);
      console.log("Formulaire valide:", form.formState.isValid);
      console.log("Erreurs du formulaire:", form.formState.errors);
      
             const tradeData = {
         ...data,
         tradeDate: data.tradeDate,
         journalId: journalId!,
         isClosed: true,
       };
      
      console.log("Données envoyées à la mutation:", tradeData);
      
      const result = await createTradeMutation.mutateAsync(tradeData);
      console.log("Trade créé avec succès:", result);
    } catch (error) {
      console.error("=== ERREUR CRÉATION TRADE ===");
      console.error("Erreur complète:", error);
      console.error("Message d'erreur:", error instanceof Error ? error.message : "Erreur inconnue");
      console.error("Stack trace:", error instanceof Error ? error.stack : "Pas de stack trace");
    }
  };

  const handleCreateAsset = async () => {
    if (newAsset.name && newAsset.symbol && journalId) {
      try {
        await createAssetMutation.mutateAsync({
          journalId,
          name: newAsset.name,
          symbol: newAsset.symbol,
          type: newAsset.type,
        });
      } catch (error) {
        console.error("Erreur lors de la création de l'asset:", error);
      }
    }
  };

  const handleCreateSession = async () => {
    if (newSession.name && journalId) {
      try {
        await createSessionMutation.mutateAsync({
          journalId,
          name: newSession.name,
          description: newSession.description,
        });
      } catch (error) {
        console.error("Erreur lors de la création de la session:", error);
      }
    }
  };

  const handleCreateSetup = async () => {
    if (newSetup.name && journalId) {
      try {
        await createSetupMutation.mutateAsync({
          journalId,
          name: newSetup.name,
          description: newSetup.description,
          strategy: newSetup.strategy,
        });
      } catch (error) {
        console.error("Erreur lors de la création du setup:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Nouveau Trade</CardTitle>
              <CardDescription>
                Ajoutez un nouveau trade à votre journal
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Date */}
            <div>
              <Label htmlFor="tradeDate">Date</Label>
              <Input
                id="tradeDate"
                type="date"
                {...form.register("tradeDate")}
              />
              {form.formState.errors.tradeDate && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.tradeDate.message}
                </p>
              )}
            </div>

                         {/* Actif */}
             <div>
               <Label htmlFor="symbol">Actif</Label>
               <div className="flex gap-2">
                 <Select
                   value={form.watch("symbol")}
                   onValueChange={(value) => form.setValue("symbol", value)}
                 >
                   <SelectTrigger className="flex-1">
                     <SelectValue placeholder="Sélectionner un actif" />
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
                 >
                   <Plus className="h-4 w-4" />
                 </Button>
               </div>
               
               {showNewAssetForm && (
                <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Nom de l'actif"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    />
                    <Input
                      placeholder="Symbole"
                      value={newAsset.symbol}
                      onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2"
                    onClick={handleCreateAsset}
                    disabled={createAssetMutation.isPending}
                  >
                    {createAssetMutation.isPending ? "Création..." : "Créer l'actif"}
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
              <Label htmlFor="sessionId">Session</Label>
              <div className="flex gap-2">
                <Select
                  value={form.watch("sessionId") || ""}
                  onValueChange={(value) => form.setValue("sessionId", value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner une session" />
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
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showNewSessionForm && (
                <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                  <Input
                    placeholder="Nom de la session"
                    value={newSession.name}
                    onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                    className="mb-2"
                  />
                  <Textarea
                    placeholder="Description"
                    value={newSession.description}
                    onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                    rows={2}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2"
                    onClick={handleCreateSession}
                    disabled={createSessionMutation.isPending}
                  >
                    {createSessionMutation.isPending ? "Création..." : "Créer la session"}
                  </Button>
                </div>
              )}
            </div>

            {/* Setup */}
            <div>
              <Label htmlFor="setupId">Setup</Label>
              <div className="flex gap-2">
                <Select
                  value={form.watch("setupId") || ""}
                  onValueChange={(value) => form.setValue("setupId", value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner un setup" />
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
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showNewSetupForm && (
                <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                  <Input
                    placeholder="Nom du setup"
                    value={newSetup.name}
                    onChange={(e) => setNewSetup({ ...newSetup, name: e.target.value })}
                    className="mb-2"
                  />
                  <Textarea
                    placeholder="Description"
                    value={newSetup.description}
                    onChange={(e) => setNewSetup({ ...newSetup, description: e.target.value })}
                    rows={2}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Stratégie"
                    value={newSetup.strategy}
                    onChange={(e) => setNewSetup({ ...newSetup, strategy: e.target.value })}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2"
                    onClick={handleCreateSetup}
                    disabled={createSetupMutation.isPending}
                  >
                    {createSetupMutation.isPending ? "Création..." : "Créer le setup"}
                  </Button>
                </div>
              )}
            </div>

                         {/* Risk, Résultat et Raison de sortie */}
             <div className="grid grid-cols-3 gap-4">
               <div>
                 <Label htmlFor="riskInput">Risk (%)</Label>
                 <Input
                   id="riskInput"
                   {...form.register("riskInput")}
                   placeholder="2.0"
                 />
                 {form.formState.errors.riskInput && (
                   <p className="text-red-500 text-sm mt-1">
                     {form.formState.errors.riskInput.message}
                   </p>
                 )}
               </div>

               <div>
                 <Label htmlFor="profitLossPercentage">Résultat (%)</Label>
                 <Input
                   id="profitLossPercentage"
                   {...form.register("profitLossPercentage")}
                   placeholder="2.5"
                 />
                 {form.formState.errors.profitLossPercentage && (
                   <p className="text-red-500 text-sm mt-1">
                     {form.formState.errors.profitLossPercentage.message}
                   </p>
                 )}
               </div>

               <div>
                 <Label htmlFor="exitReason">Raison de sortie</Label>
                 <Select
                   value={form.watch("exitReason") || ""}
                   onValueChange={(value) => form.setValue("exitReason", value as "TP" | "BE" | "SL" | "Manual")}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Sélectionner" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="TP">TP (Take Profit)</SelectItem>
                     <SelectItem value="BE">BE (Break Even)</SelectItem>
                     <SelectItem value="SL">SL (Stop Loss)</SelectItem>
                     <SelectItem value="Manual">Manual</SelectItem>
                   </SelectContent>
                 </Select>
                 {form.formState.errors.exitReason && (
                   <p className="text-red-500 text-sm mt-1">
                     {form.formState.errors.exitReason.message}
                   </p>
                 )}
               </div>
             </div>

            {/* Lien TradingView */}
            <div>
              <Label htmlFor="tradingviewLink">Lien TradingView (optionnel)</Label>
              <Input
                id="tradingviewLink"
                {...form.register("tradingviewLink")}
                placeholder="https://www.tradingview.com/..."
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Notes sur le trade..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createTradeMutation.isPending}
                className="bg-black text-white hover:bg-gray-800"
              >
                {createTradeMutation.isPending ? "Création..." : "Créer le trade"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 