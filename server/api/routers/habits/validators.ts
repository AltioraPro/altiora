import { z } from "zod";

export const createHabitValidator = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title too long"),
    emoji: z.string().min(1, "Emoji is required").max(10, "Emoji too long"),
    description: z.string().optional(),
    color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
        .optional(),
    targetFrequency: z.enum(["daily", "weekly", "monthly"]).default("daily"),
    sortOrder: z.number().int().min(0).optional(),
});

export const updateHabitValidator = z.object({
    id: z.string().min(1, "Habit ID is required"),
    title: z
        .string()
        .min(1, "Title is required")
        .max(255, "Title too long")
        .optional(),
    emoji: z
        .string()
        .min(1, "Emoji is required")
        .max(10, "Emoji too long")
        .optional(),
    description: z.string().optional(),
    color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
        .optional(),
    targetFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
});

export const deleteHabitValidator = z.object({
    id: z.string().min(1, "Habit ID is required"),
});

export const toggleHabitCompletionValidator = z.object({
    habitId: z.string().min(1, "Habit ID is required"),
    completionDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    isCompleted: z.boolean(),
    notes: z.string().optional(),
});

export const getHabitStatsValidator = z.object({
    period: z.enum(["week", "month", "quarter", "year"]).default("month"),
});

export const getHabitsPaginatedValidator = z.object({
    page: z.number().int().min(0).default(0),
    limit: z.number().int().min(1).max(100).default(10),
    sortBy: z.enum(["title", "createdAt", "sortOrder"]).default("sortOrder"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
    search: z.string().optional(),
    showInactive: z.boolean().default(false),
});

export const getDashboardValidator = z
    .object({
        viewMode: z.enum(["today", "week", "month"]).default("today"),
    })
    .optional()
    .default({ viewMode: "today" });
