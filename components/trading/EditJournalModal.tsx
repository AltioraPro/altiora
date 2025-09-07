"use client";

import { useState, useEffect } from "react";
import type { TradingJournal } from "@/server/db/schema";
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

interface EditJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  journal: Pick<TradingJournal, "id" | "name" | "description" | "isDefault">;
  onSuccess?: () => void;
}

export function EditJournalModal({ isOpen, onClose, journal, onSuccess }: EditJournalModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Initialize form with journal data
  useEffect(() => {
    if (journal) {
      setName(journal.name || "");
      setDescription(journal.description || "");
      setIsDefault(journal.isDefault || false);
    }
  }, [journal]);

  const updateJournalMutation = api.trading.updateJournal.useMutation({
    onSuccess: () => {
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
      await updateJournalMutation.mutateAsync({
        id: journal.id,
        name: name.trim(),
        description: description.trim(),
        isDefault,
      });
    } catch (error) {
      console.error("Error updating journal:", error);
    }
  };

  const handleClose = () => {
    if (!updateJournalMutation.isPending) {
      onClose();
    }
  };

  if (!journal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-black border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Edit journal</DialogTitle>
          <DialogDescription className="text-white/70">
            Edit your trading journal information.
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
                disabled={updateJournalMutation.isPending}
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
                disabled={updateJournalMutation.isPending}
                className="bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                disabled={updateJournalMutation.isPending}
              />
              <Label htmlFor="isDefault" className="text-sm text-white/80">
                Set as default journal
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateJournalMutation.isPending}
              className="border-white/30 text-white hover:bg-white hover:text-black transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateJournalMutation.isPending || !name.trim()}
              className="bg-white text-black hover:bg-white/90 transition-colors"
            >
              {updateJournalMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 