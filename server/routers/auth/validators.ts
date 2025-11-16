import { z } from "zod";

export const waitlistStatuses = ["approved", "pending", "rejected"] as const;
export type WaitlistStatus = (typeof waitlistStatuses)[number];

export const listUsersSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().min(1).max(100).default(25),
    sortBy: z
        .enum(["user", "waitlistStatus", "role", "createdAt"])
        .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    search: z.string().nullable(),
    role: z.enum(["admin", "user", "all"]).optional(),
    waitlistStatus: z
        .enum(["approved", "pending", "rejected", "all"])
        .optional(),
});

export const listWaitlistSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().min(1).max(100).default(25),
    sortBy: z
        .enum(["email", "waitlistStatus", "registrationStatus", "createdAt"])
        .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    search: z.string().nullable(),
    waitlistStatus: z
        .enum(["approved", "pending", "rejected", "all"])
        .optional(),
    registrationStatus: z
        .enum(["registered", "unregistered", "all"])
        .default("all"),
});

export const banMultipleUsersSchema = z.object({
    userIds: z.array(z.string()).min(1),
});

export const updateMultipleUsersStatusSchema = z.object({
    emails: z.array(z.string()).min(1),
    status: z.enum(["approved", "pending", "rejected"]),
});

export const syncUserSchema = z.object({
    id: z.string().min(1, "ID requis"),
    email: z.email("Email invalide"),
    name: z.string().min(1, "Le nom est requis"),
    image: z.string().url("URL d'image invalide").optional(),
});

export const sendVerificationEmailSchema = z.object({
    email: z.email("Email invalide"),
});

export const getUserEmailStatusSchema = z.object({
    email: z.email("Email invalide"),
});

export const verifyEmailSchema = z.object({
    token: z.string().min(1, "Token requis"),
});

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(1, "Le nom est requis")
        .max(255, "Le nom est trop long"),
});

export const updateRankSchema = z.object({
    rank: z.enum(["NEW", "BEGINNER", "RISING", "CHAMPION", "EXPERT", "LEGEND"]),
});

export const updateLeaderboardVisibilitySchema = z.object({
    isPublic: z.boolean(),
});

export const waitlistSchema = z.object({
    email: z.email(),
});

export type SyncUserInput = z.infer<typeof syncUserSchema>;
export type SendVerificationEmailInput = z.infer<
    typeof sendVerificationEmailSchema
>;
export type GetUserEmailStatusInput = z.infer<typeof getUserEmailStatusSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateRankInput = z.infer<typeof updateRankSchema>;
export type UpdateLeaderboardVisibilityInput = z.infer<
    typeof updateLeaderboardVisibilitySchema
>;

export type WaitlistInput = z.infer<typeof waitlistSchema>;
