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
  Award,
  Clock
} from "lucide-react";
import { type Goal } from "@/server/db/schema";
import { GoalReminders } from "./GoalReminders";


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
      utils.goals.getPaginated.invalidate();
      utils.goals.getStats.invalidate();
      utils.goals.getAll.invalidate();
      utils.goals.getAllGoalLimits.invalidate();
      onGoalChange?.(); 
    },
  });

  const deleteMutation = api.goals.delete.useMutation({
    onSuccess: () => {
      utils.goals.getPaginated.invalidate();
      utils.goals.getStats.invalidate();
      utils.goals.getAll.invalidate();
      utils.goals.getAllGoalLimits.invalidate();
      onGoalChange?.(); 
    },
  });

  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !goal.isCompleted;



  const getStatusColor = () => {
    if (goal.isCompleted) return "bg-green-500/30 text-green-400 border-green-500/50 shadow-lg shadow-green-500/20";
    if (isOverdue) return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const getGoalIcon = () => {
    if (goal.isCompleted) return <Award className="w-5 h-5" />;
    if (isOverdue) return <Clock className="w-5 h-5" />;
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
                <div className="w-6 h-6 bg-gradient-to-br from-green-500/30 to-green-400/20 rounded-full flex items-center justify-center border border-green-400/40 group-hover/button:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/20">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
              ) : (
                <div className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center border border-white/20 hover:border-green-400/40 hover:bg-green-500/10 transition-all duration-300 group-hover/button:scale-110">
                  <Circle className="w-4 h-4 text-white/60 group-hover/button:text-green-400" />
                </div>
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <h3 
                className={`text-lg font-semibold break-words line-clamp-2 mb-2 ${goal.isCompleted ? 'line-through text-green-400/60' : 'text-white'} transition-all duration-300`}
                title={goal.title}
              >
                {goal.title}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`text-xs ${getStatusColor()}`}>
                  {goal.isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Active'}
                </Badge>
              </div>
              
              {goal.description && (
                <p className={`text-sm ${goal.isCompleted ? 'text-green-400/40' : 'text-white/60'} line-clamp-2`}>
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

  return (
    <div className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:scale-105 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <div className="text-white/80">
                {getGoalIcon()}
              </div>
            </div>
            <div className="flex gap-2">
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

        <div className="mb-4">
          <h3 
            className={`text-lg font-semibold mb-2 break-words line-clamp-3 ${goal.isCompleted ? 'line-through text-green-400/60' : 'text-white'} transition-all duration-300`}
            title={goal.title}
          >
            {goal.title}
          </h3>
          {goal.description && (
            <p 
              className={`text-sm break-words ${goal.isCompleted ? 'text-green-400/40' : 'text-white/60'} line-clamp-2`}
              title={goal.description}
            >
              {goal.description}
            </p>
          )}
        </div>



        <div className="space-y-4 pt-4 border-t border-white/10">
          <GoalReminders
            goalId={goal.id}
            currentFrequency={goal.reminderFrequency as "daily" | "weekly" | "monthly" | null}
            nextReminderDate={goal.nextReminderDate}
            isActive={goal.isActive}
          />
          
          <div className="flex items-center justify-between">
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
              className={`group/button flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 ${
                goal.isCompleted 
                  ? 'bg-green-500/20 hover:bg-green-500/30 border-green-400/40 hover:border-green-400/60' 
                  : 'bg-white/5 hover:bg-green-500/10 border-white/10 hover:border-green-400/40'
              }`}
              disabled={markCompletedMutation.isPending}
            >
              {goal.isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Done</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-white/60 group-hover/button:text-green-400 transition-colors" />
                  <span className="text-sm text-white/60 group-hover/button:text-green-400 transition-colors">Complete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 