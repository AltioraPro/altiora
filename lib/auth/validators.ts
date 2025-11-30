import { z } from "zod";

export const confirmAccessSchema = z.object({
    password: z.string().min(1, { error: "Password is required" }),
});

export const signInSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(1, { error: "Password is required" }),
    rememberMe: z.boolean().default(false),
});

export const signUpSchema = z.object({
    fullName: z
        .string()
        .min(3, { error: "Name must be at least 3 characters long" }),
    email: z.email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, { error: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, {
            error: "Password must contain at least 1 uppercase letter",
        })
        .regex(/[0-9]/, { error: "Password must contain at least 1 number" }),
    acceptTerms: z
        .boolean()
        .refine((val) => val === true, "You must accept the terms"),
});

export const verifyEmailSchema = z.object({
    otp: z
        .string()
        .min(6, { error: "OTP must be 6 digits long" })
        .max(6, { error: "OTP must be 6 digits long" })
        .regex(/^\d+$/, { error: "OTP must contain only numbers" }),
});

export const forgotPasswordSchema = z.object({
    email: z.email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
    .object({
        password: z.string().min(8),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        error: "Passwords don't match",
        path: ["confirmPassword"],
    });

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(8, { error: "Current password is required" }),
        newPassword: z
            .string()
            .min(8, { error: "Password must be at least 8 characters long" })
            .regex(/[A-Z]/, {
                error: "Password must contain at least 1 uppercase letter",
            })
            .regex(/[0-9]/, {
                error: "Password must contain at least 1 number",
            }),
        confirmPassword: z
            .string()
            .min(8, {
                error: "Confirm password must be at least 8 characters long",
            })
            .regex(/[A-Z]/, {
                error: "Confirm password must contain at least 1 uppercase letter",
            })
            .regex(/[0-9]/, {
                error: "Confirm password must contain at least 1 number",
            }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        error: "Passwords don't match",
        path: ["confirmPassword"],
    });

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
