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
  const [isDefault, setIsDefault] = useState(false);

  const createJournalMutation = api.trading.createJournal.useMutation({
    onSuccess: () => {
      // Reset form
      setName("");
      setDescription("");
      setIsDefault(false);
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
        isDefault,
      });
    } catch (error) {
      console.error("Error creating journal:", error);
    }
  };

  const handleClose = () => {
    if (!createJournalMutation.isPending) {
      setName("");
      setDescription("");
      setIsDefault(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new journal</DialogTitle>
          <DialogDescription>
            Create a new trading journal to organize your trades and track your performance.
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
                disabled={createJournalMutation.isPending}
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
                disabled={createJournalMutation.isPending}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                disabled={createJournalMutation.isPending}
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
              disabled={createJournalMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createJournalMutation.isPending || !name.trim()}
              className="bg-black text-white hover:bg-gray-800"
            >
              {createJournalMutation.isPending ? "Creating..." : "Create journal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 