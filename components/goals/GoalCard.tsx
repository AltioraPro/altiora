"use client";

import React from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Circle, 
  Edit, 
  Trash2, 
  Target, 
  Calendar,
  TrendingUp,
  Award,
  Clock
} from "lucide-react";
import { type Goal } from "@/server/db/schema";


interface GoalCardProps {
  goal: Goal;
  viewMode: "grid" | "list";
  onGoalChange?: () => void;
  onEditGoal?: (goal: Goal) => void;
}

export function GoalCard({ goal, viewMode, onGoalChange, onEditGoal }: GoalCardProps) {
  const utils = api.useUtils();

  const markCompletedMutation = api.goals.markCompleted.useMutation({
    onSuccess: () => {
      // Invalider toutes les requêtes goals
      utils.goals.getPaginated.invalidate();
      utils.goals.getStats.invalidate();
      utils.goals.getAll.invalidate();
      onGoalChange?.(); // Appeler le callback pour mettre à jour les stats
    },
  });

  const deleteMutation = api.goals.delete.useMutation({
    onSuccess: () => {
      // Invalider toutes les requêtes goals
      utils.goals.getPaginated.invalidate();
      utils.goals.getStats.invalidate();
      utils.goals.getAll.invalidate();
      onGoalChange?.(); // Appeler le callback pour mettre à jour les stats
    },
  });

  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !goal.isCompleted;
  const progressPercentage = goal.goalType === "gradual" && goal.targetValue && goal.currentValue
    ? Math.min(100, Math.round((parseFloat(goal.currentValue) / parseFloat(goal.targetValue)) * 100))
    : 0;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "annual": return "bg-white/10 text-white/80 border-white/20";
      case "quarterly": return "bg-white/10 text-white/80 border-white/20";
      case "custom": return "bg-white/10 text-white/80 border-white/20";
      default: return "bg-white/10 text-white/80 border-white/20";
    }
  };

  const getStatusColor = () => {
    if (goal.isCompleted) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (isOverdue) return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const getGoalIcon = () => {
    if (goal.isCompleted) return <Award className="w-5 h-5" />;
    if (isOverdue) return <Clock className="w-5 h-5" />;
    if (progressPercentage > 50) return <TrendingUp className="w-5 h-5" />;
    return <Target className="w-5 h-5" />;
  };

  const handleMarkCompleted = () => {
    markCompletedMutation.mutate({ id: goal.id, isCompleted: !goal.isCompleted });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteMutation.mutate({ id: goal.id });
    }
  };

  if (viewMode === "list") {
    return (
      <div className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={handleMarkCompleted}
              className="flex-shrink-0 group/button"
              disabled={markCompletedMutation.isPending}
            >
              {goal.isCompleted ? (
                <div className="w-6 h-6 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center border border-white/20 group-hover/button:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300 group-hover/button:scale-110">
                  <Circle className="w-4 h-4 text-white/60" />
                </div>
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`text-lg font-semibold ${goal.isCompleted ? 'line-through text-white/40' : 'text-white'} transition-all duration-300`}>
                  {goal.title}
                </h3>
                <Badge className={`text-xs ${getTypeColor(goal.goalType)}`}>
                  {goal.goalType}
                </Badge>
                <Badge className={`text-xs ${getStatusColor()}`}>
                  {goal.isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Active'}
                </Badge>
              </div>
              
              {goal.description && (
                <p className={`text-sm ${goal.isCompleted ? 'text-white/30' : 'text-white/60'} line-clamp-2`}>
                  {goal.description}
                </p>
              )}
              
              {goal.deadline && (
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4 text-white/40" />
                  <span className={`text-sm ${isOverdue ? 'text-white/60' : 'text-white/40'}`}>
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditGoal?.(goal)}
              className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View compact pour bento grid
  return (
    <div className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:scale-105 overflow-hidden">
      {/* Background avec effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative">
        {/* Header compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <div className="text-white/80">
                {getGoalIcon()}
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={`text-xs ${getTypeColor(goal.goalType)}`}>
                {goal.goalType}
              </Badge>
              <Badge className={`text-xs ${getStatusColor()}`}>
                {goal.isCompleted ? 'Done' : isOverdue ? 'Late' : 'Active'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditGoal?.(goal)}
              className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Titre et description */}
        <div className="mb-4">
          <h3 className={`text-lg font-semibold mb-2 ${goal.isCompleted ? 'line-through text-white/40' : 'text-white'} transition-all duration-300`}>
            {goal.title}
          </h3>
          {goal.description && (
            <p className={`text-sm ${goal.isCompleted ? 'text-white/30' : 'text-white/60'} line-clamp-2`}>
              {goal.description}
            </p>
          )}
        </div>

        {/* Progress Bar pour les objectifs graduels */}
        {goal.goalType === "gradual" && goal.targetValue && goal.currentValue && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Progress</span>
              <span className="text-sm font-medium text-white/80">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-full" />
              <div 
                className="relative h-2 rounded-full bg-gradient-to-r from-white/60 via-white/40 to-white/20 transition-all duration-1000 ease-out"
                style={{ 
                  width: `${progressPercentage}%`,
                  boxShadow: `0 0 10px rgba(255, 255, 255, ${progressPercentage / 100 * 0.3})`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>{goal.currentValue}</span>
              <span>{goal.targetValue}</span>
            </div>
          </div>
        )}

        {/* Footer compact */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {goal.deadline && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/40" />
              <span className={`text-sm ${isOverdue ? 'text-white/60' : 'text-white/40'}`}>
                {new Date(goal.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
          
          <button
            onClick={handleMarkCompleted}
            className="group/button flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-300"
            disabled={markCompletedMutation.isPending}
          >
            {goal.isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Done</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-white/60 group-hover/button:text-white transition-colors" />
                <span className="text-sm text-white/60 group-hover/button:text-white transition-colors">Complete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 