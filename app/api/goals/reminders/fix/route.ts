import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { goals, user } from "@/server/db/schema";

/**
 * Calcule la prochaine date de rappel à 9h00 dans le timezone de l'utilisateur
 */
function calculateNextReminderInTimezone(
    frequency: "daily" | "weekly" | "monthly",
    userTimezone: string = "UTC"
): Date {
    const now = new Date();
    const nextDate = new Date(now);

    switch (frequency) {
        case "daily":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        default:
            nextDate.setDate(nextDate.getDate() + 1);
            break;
    }

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
    const utcDate = new Date(targetDate.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(targetDate.toLocaleString("en-US", { timeZone: userTimezone }));
    const tzOffset = tzDate.getTime() - utcDate.getTime();
    targetDate.setTime(targetDate.getTime() - tzOffset);

    return targetDate;
}

export async function POST() {
    try {
        console.info("Correction des rappels non programmés");

        const now = new Date();

        const goalsToFix = await db
            .select()
            .from(goals)
            .where(
                and(
                    eq(goals.remindersEnabled, true),
                    isNull(goals.nextReminderDate),
                    eq(goals.isCompleted, false),
                    eq(goals.isActive, true)
                )
            );

        console.info(`${goalsToFix.length} objectifs à corriger`);

        const fixedGoals: {
            id: string;
            title: string;
            reminderFrequency: string;
            nextReminderDate: Date;
        }[] = [];

        for (const goal of goalsToFix) {
            if (!goal.reminderFrequency) {
                continue;
            }

            // Récupérer le timezone de l'utilisateur
            const [userData] = await db
                .select({ timezone: user.timezone })
                .from(user)
                .where(eq(user.id, goal.userId))
                .limit(1);
            const userTimezone = userData?.timezone || "UTC";

            const nextReminderDate = calculateNextReminderInTimezone(
                goal.reminderFrequency as "daily" | "weekly" | "monthly",
                userTimezone
            );

            await db
                .update(goals)
                .set({
                    nextReminderDate,
                    updatedAt: now,
                })
                .where(eq(goals.id, goal.id));

            fixedGoals.push({
                id: goal.id,
                title: goal.title,
                reminderFrequency: goal.reminderFrequency,
                nextReminderDate,
            });

            console.info(
                `Corrigé: ${goal.title} -> ${nextReminderDate.toISOString()} (timezone: ${userTimezone})`
            );
        }

        return NextResponse.json({
            success: true,
            message: `${fixedGoals.length} objectifs corrigés`,
            fixedGoals,
        });
    } catch (error) {
        console.error("Erreur lors de la correction:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Erreur lors de la correction",
                details:
                    error instanceof Error ? error.message : "Erreur inconnue",
            },
            { status: 500 }
        );
    }
}
