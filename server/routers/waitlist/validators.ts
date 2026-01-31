import { z } from "zod";

export const joinWaitlistSchema = z.object({
    email: z.string().email("Email invalide"),
    firstName: z.string().min(1, "Prénom requis").max(100, "Prénom trop long"),
});

export const listWaitlistSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().min(1).max(100).default(25),
    sortBy: z.enum(["email", "firstName", "createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    search: z.string().nullable(),
});

export const deleteWaitlistSchema = z.object({
    ids: z.array(z.string()).min(1),
});

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;
export type ListWaitlistInput = z.infer<typeof listWaitlistSchema>;
export type DeleteWaitlistInput = z.infer<typeof deleteWaitlistSchema>;
