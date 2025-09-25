import { z } from "zod";

export const createGoalValidator = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  type: z.enum(["annual", "quarterly", "monthly"]).default("monthly"),
  goalType: z.enum(["gradual"]).default("gradual"),
  targetValue: z.string().optional(),
  currentValue: z.string().optional(),
  unit: z.string().optional(),
  deadline: z.date().optional(),
  remindersEnabled: z.boolean().default(false),
  reminderFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateGoalValidator = z.object({
  id: z.string().min(1, "Goal ID is required"),
  title: z.string().min(1, "Title is required").max(255, "Title too long").optional(),
  description: z.string().optional(),
  type: z.enum(["annual", "quarterly", "monthly"]).optional(),
  goalType: z.enum(["gradual"]).optional(),
  targetValue: z.string().optional(),
  currentValue: z.string().optional(),
  unit: z.string().optional(),
  deadline: z.date().optional(),
  isCompleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  remindersEnabled: z.boolean().optional(),
  reminderFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const deleteGoalValidator = z.object({
  id: z.string().min(1, "Goal ID is required"),
});

export const markGoalCompletedValidator = z.object({
  id: z.string().min(1, "Goal ID is required"),
  isCompleted: z.boolean(),
});

export const updateGoalProgressValidator = z.object({
  id: z.string().min(1, "Goal ID is required"),
  currentValue: z.string(),
});

export const getGoalsPaginatedValidator = z.object({
  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["title", "createdAt", "deadline", "sortOrder"]).default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  search: z.string().optional(),
  type: z.enum(["annual", "quarterly", "monthly"]).optional(),
  status: z.enum(["active", "completed", "overdue"]).optional(),
  showInactive: z.boolean().default(false),
});

export const getGoalStatsValidator = z.object({
  period: z.enum(["week", "month", "quarter", "year"]).default("month"),
});

// Sous-objectifs
export const createSubGoalValidator = z.object({
  goalId: z.string().min(1, "Goal ID is required"),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateSubGoalValidator = z.object({
  id: z.string().min(1, "Sub-goal ID is required"),
  title: z.string().min(1, "Title is required").max(255, "Title too long").optional(),
  description: z.string().optional(),
  isCompleted: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const deleteSubGoalValidator = z.object({
  id: z.string().min(1, "Sub-goal ID is required"),
});

export const createGoalTaskValidator = z.object({
  goalId: z.string().min(1, "Goal ID is required"),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateGoalTaskValidator = z.object({
  id: z.string().min(1, "Task ID is required"),
  title: z.string().min(1, "Title is required").max(255, "Title too long").optional(),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  isCompleted: z.boolean().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const deleteGoalTaskValidator = z.object({
  id: z.string().min(1, "Task ID is required"),
}); 