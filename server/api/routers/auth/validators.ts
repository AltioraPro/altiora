import { z } from "zod";

export const syncUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  image: z.string().optional(),
  emailVerified: z.boolean().optional(),
});

export const sendVerificationEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const getUserEmailStatusSchema = z.object({
  email: z.string().email("Invalid email address"),
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