"use client";

import { useState, useEffect } from "react";
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
  journal: any;
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit journal</DialogTitle>
          <DialogDescription>
            Edit your trading journal information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Journal name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Main Journal"
                disabled={updateJournalMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional journal description"
                rows={3}
                disabled={updateJournalMutation.isPending}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                disabled={updateJournalMutation.isPending}
              />
              <Label htmlFor="isDefault" className="text-sm">
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateJournalMutation.isPending || !name.trim()}
              className="bg-black text-white hover:bg-gray-800"
            >
              {updateJournalMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 