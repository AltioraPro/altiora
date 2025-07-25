import { z } from "zod";

export const syncUserSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z.string().min(1, "Le nom est requis"),
  image: z.string().url("URL d'image invalide").optional(),
});

export const sendVerificationEmailSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const getUserEmailStatusSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token requis"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(255, "Le nom est trop long"),
});

export const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type SyncUserInput = z.infer<typeof syncUserSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>; 