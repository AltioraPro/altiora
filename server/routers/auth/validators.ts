import { z } from "zod";

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
