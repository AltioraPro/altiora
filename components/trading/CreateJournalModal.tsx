"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateJournalModal({ isOpen, onClose, onSuccess }: CreateJournalModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startingCapital, setStartingCapital] = useState("");
  const [usePercentageCalculation, setUsePercentageCalculation] = useState(false);

  const createJournalMutation = api.trading.createJournal.useMutation({
    onSuccess: () => {
      setName("");
      setDescription("");
      setStartingCapital("");
      setUsePercentageCalculation(false);
      onSuccess?.();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("Journal name is required");
      return;
    }

    try {
      await createJournalMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        startingCapital: startingCapital.trim() || undefined,
        usePercentageCalculation,
      });
    } catch (error) {
      console.error("Error creating journal:", error);
    }
  };

  const handleClose = () => {
    if (!createJournalMutation.isPending) {
      setName("");
      setDescription("");
      setStartingCapital("");
      setUsePercentageCalculation(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-black border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Create a new journal</DialogTitle>
          <DialogDescription className="text-white/70">
            Create a new trading journal to organize your trades and track your performance.
            Enable percentage calculation for automatic BE/TP/SL detection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-white/80">Journal name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Main Journal"
                disabled={createJournalMutation.isPending}
                className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-white/80">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional journal description"
                rows={3}
                disabled={createJournalMutation.isPending}
                className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="usePercentageCalculation"
                checked={usePercentageCalculation}
                onCheckedChange={(checked) => setUsePercentageCalculation(checked as boolean)}
                disabled={createJournalMutation.isPending}
              />
              <Label htmlFor="usePercentageCalculation" className="text-sm text-white/80">
                Use percentage calculation
              </Label>
            </div>
            {usePercentageCalculation && (
              <div className="grid gap-2">
                <Label htmlFor="startingCapital" className="text-white/80">Starting capital</Label>
                <Input
                  id="startingCapital"
                  value={startingCapital}
                  onChange={(e) => setStartingCapital(e.target.value)}
                  placeholder="Ex: 10000"
                  type="number"
                  step="0.01"
                  disabled={createJournalMutation.isPending}
                  className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                />
                <p className="text-xs text-white/50">
                  The starting capital allows to calculate percentages automatically when creating trades
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createJournalMutation.isPending}
              className="border-white/30 text-black hover:bg-white hover:text-black transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createJournalMutation.isPending || !name.trim()}
              className="bg-white text-black hover:bg-white/90 transition-colors"
            >
              {createJournalMutation.isPending ? "Creating..." : "Create journal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 