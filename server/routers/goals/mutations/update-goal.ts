import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { goals, user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateGoalValidator } from "../validators";

/**
 * Calcule la prochaine date de reminder à 9h00 dans le timezone de l'utilisateur
 */
function calculateNextReminderDate(
    frequency: "daily" | "weekly" | "monthly" | null | undefined,
    userTimezone = "UTC"
): Date | null {
    if (!frequency) {
        return null;
    }

    const now = new Date();
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + 1); // Demain

    // Obtenir l'heure 9h00 dans le timezone de l'utilisateur
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: userTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const parts = formatter.formatToParts(nextDate);
    const year = Number.parseInt(
        parts.find((p) => p.type === "year")?.value || "2024",
        10
    );
    const month = Number.parseInt(
        parts.find((p) => p.type === "month")?.value || "1",
        10
    );
    const day = Number.parseInt(
        parts.find((p) => p.type === "day")?.value || "1",
        10
    );

    // Créer une date à 9h00 UTC puis ajuster pour le timezone
    const targetDate = new Date(Date.UTC(year, month - 1, day, 9, 0, 0, 0));

    // Calculer le décalage horaire du timezone de l'utilisateur
    const utcDate = new Date(
        targetDate.toLocaleString("en-US", { timeZone: "UTC" })
    );
    const tzDate = new Date(
        targetDate.toLocaleString("en-US", { timeZone: userTimezone })
    );
    const tzOffset = tzDate.getTime() - utcDate.getTime();
    targetDate.setTime(targetDate.getTime() - tzOffset);

    return targetDate;
}

export const updateGoalBase = protectedProcedure.input(updateGoalValidator);

export const updateGoalHandler = updateGoalBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { id, ...updateData } = input;

        // Récupérer le timezone de l'utilisateur
        const [userData] = await db
            .select({ timezone: user.timezone })
            .from(user)
            .where(eq(user.id, session.user.id))
            .limit(1);
        const userTimezone = userData?.timezone || "UTC";

        // Si on active les reminders, calculer nextReminderDate avec le timezone
        let nextReminderDate: Date | null | undefined;
        if (
            updateData.remindersEnabled === true &&
            updateData.reminderFrequency
        ) {
            nextReminderDate = calculateNextReminderDate(
                updateData.reminderFrequency,
                userTimezone
            );
        } else if (updateData.remindersEnabled === false) {
            // Si on désactive, reset les champs
            nextReminderDate = null;
        }

        const [updatedGoal] = await db
            .update(goals)
            .set({
                ...updateData,
                ...(nextReminderDate !== undefined && { nextReminderDate }),
                updatedAt: new Date(),
            })
            .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
            .returning();

        if (!updatedGoal) {
            throw new ORPCError("NOT_FOUND", {
                message: "Goal not found",
            });
        }

        return updatedGoal;
    }
);
