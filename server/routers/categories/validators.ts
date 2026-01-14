import { z } from "zod";

// Category validators
export const createCategoryValidator = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
        .default("#6366f1"),
    icon: z.string().max(50).optional(),
});

export const updateCategoryValidator = z.object({
    id: z.string().min(1, "Category ID is required"),
    name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name too long")
        .optional(),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
        .optional(),
    icon: z.string().max(50).nullable().optional(),
});

export const deleteCategoryValidator = z.object({
    id: z.string().min(1, "Category ID is required"),
});

export const getCategoryByIdValidator = z.object({
    id: z.string().min(1, "Category ID is required"),
});
