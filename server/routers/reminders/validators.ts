import { z } from "zod";

export const scheduleReminderSchema = z.object({
    goalId: z.string(),
    frequency: z.enum(["daily", "weekly", "monthly"]),
});

export const cancelRemindersSchema = z.object({
    goalId: z.string(),
});

export type ScheduleReminderInput = z.infer<typeof scheduleReminderSchema>;
export type CancelRemindersInput = z.infer<typeof cancelRemindersSchema>;
