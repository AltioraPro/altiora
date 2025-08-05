"use client";

import React, { useState } from "react";
import { api } from "@/trpc/client";
import { X, Crown, AlertCircle } from "lucide-react";
import { useOptimizedGoalMutation } from "@/hooks/useOptimizedGoalMutation";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGoalModal({ isOpen, onClose }: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "annual" as "annual" | "quarterly" | "monthly",
    deadline: "",
    remindersEnabled: false,
    reminderFrequency: "weekly" as "daily" | "weekly" | "monthly",
  });

  // Vérifier toutes les restrictions en une seule requête optimisée
  const { data: goalLimits } = api.goals.getAllGoalLimits.useQuery(
    undefined,
    { 
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  // Déterminer le type par défaut basé sur les restrictions
  React.useEffect(() => {
    if (goalLimits?.annual.canCreate) {
      setFormData(prev => ({ ...prev, type: "annual" }));
    } else if (goalLimits?.quarterly.canCreate) {
      setFormData(prev => ({ ...prev, type: "quarterly" }));
    } else if (goalLimits?.monthly.canCreate) {
      setFormData(prev => ({ ...prev, type: "monthly" }));
    }
  }, [goalLimits?.annual.canCreate, goalLimits?.quarterly.canCreate, goalLimits?.monthly.canCreate]);

  const { createGoal, isCreating, createError } = useOptimizedGoalMutation();

  const handleCreateGoal = (data: {
    title: string;
    description: string;
    type: "annual" | "quarterly" | "monthly";
    deadline?: Date;
    reminderFrequency?: "daily" | "weekly" | "monthly";
  }) => {
    createGoal(data, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      type: "annual",
      deadline: "",
      remindersEnabled: false,
      reminderFrequency: "weekly",
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    handleCreateGoal({
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      reminderFrequency: formData.remindersEnabled ? formData.reminderFrequency : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-pure-black border border-white/20 rounded-2xl w-full max-w-md max-h-[90vh] relative overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-2rem)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-argesta tracking-tight">
              NEW GOAL
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                Goal Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                placeholder="Ex: Learn React"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent resize-none"
                placeholder="Describe your goal in detail..."
              />
            </div>

            {/* Type d'objectif */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-white mb-2">
                Goal Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "annual" | "quarterly" | "monthly" })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option 
                  value="annual" 
                  className="bg-neutral-900 text-white"
                  disabled={!goalLimits?.annual.canCreate}
                >
                  Annual {!goalLimits?.annual.canCreate && `(${goalLimits?.annual.current}/${goalLimits?.annual.max})`}
                </option>
                <option 
                  value="quarterly" 
                  className="bg-neutral-900 text-white"
                  disabled={!goalLimits?.quarterly.canCreate}
                >
                  Quarterly {!goalLimits?.quarterly.canCreate && `(${goalLimits?.quarterly.current}/${goalLimits?.quarterly.max})`}
                </option>
                <option 
                  value="monthly" 
                  className="bg-neutral-900 text-white"
                  disabled={!goalLimits?.monthly.canCreate}
                >
                  Monthly {!goalLimits?.monthly.canCreate && `(${goalLimits?.monthly.current}/${goalLimits?.monthly.max})`}
                </option>
              </select>
              
              {/* Afficher les restrictions */}
              {(!goalLimits?.annual.canCreate || !goalLimits?.quarterly.canCreate || !goalLimits?.monthly.canCreate) && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Crown className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-yellow-400 font-medium mb-1">Plan Limitations</p>
                      <p className="text-yellow-300/80 text-xs">
                        You&apos;ve reached the limit for some goal types. 
                        <button 
                          onClick={() => window.open('/pricing', '_blank')}
                          className="text-yellow-400 hover:text-yellow-300 underline ml-1 mr-1"
                        >
                          Upgrade your plan
                        </button> 
                        to create unlimited goals.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Date limite */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-white mb-2">
                Deadline
              </label>
              <input
                type="date"
                id="deadline"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                style={{
                  colorScheme: 'dark'
                }}
              />
            </div>

            {/* Rappels */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="remindersEnabled"
                  checked={formData.remindersEnabled}
                  onChange={(e) => setFormData({ ...formData, remindersEnabled: e.target.checked })}
                  className="w-4 h-4 text-white bg-white/5 border-white/20 rounded focus:ring-white/20 focus:ring-2"
                />
                <label htmlFor="remindersEnabled" className="text-sm font-medium text-white">
                  Enable reminders
                </label>
              </div>

              {formData.remindersEnabled && (
                <div>
                  <label htmlFor="reminderFrequency" className="block text-sm font-medium text-white mb-2">
                    Reminder Frequency
                  </label>
                  <select
                    id="reminderFrequency"
                    value={formData.reminderFrequency}
                    onChange={(e) => setFormData({ ...formData, reminderFrequency: e.target.value as "daily" | "weekly" | "monthly" })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="daily" className="bg-neutral-900 text-white">Daily</option>
                    <option value="weekly" className="bg-neutral-900 text-white">Weekly</option>
                    <option value="monthly" className="bg-neutral-900 text-white">Monthly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Error Message */}
            {createError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-red-400 font-medium mb-1">Error</p>
                    <p className="text-red-300/80 text-xs">
                      {createError.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center space-x-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-2 border border-white/20 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-all duration-300 font-argesta text-sm"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isCreating || !formData.title.trim()}
                className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg text-white font-argesta transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isCreating ? "CREATING..." : "CREATE"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 