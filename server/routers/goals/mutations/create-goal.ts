import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { goals, user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createGoalValidator } from "../validators";

/**
 * Calcule la prochaine date de reminder à 9h00 dans le timezone de l'utilisateur
 */
function calculateNextReminderDate(
  frequency: "daily" | "weekly" | "monthly" | null | undefined,
  userTimezone: string = "UTC"
): Date | null {
  if (!frequency) return null;

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

export const createGoalBase = protectedProcedure.input(createGoalValidator);

export const createGoalHandler = createGoalBase.handler(
  async ({ context, input }) => {
    const { db, session } = context;
    const goalId = nanoid();

    // Récupérer le timezone de l'utilisateur
    const [userData] = await db
      .select({ timezone: user.timezone })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);
    const userTimezone = userData?.timezone || "UTC";

    // Si reminders activés, calculer la prochaine date en utilisant le timezone
    const nextReminderDate =
      input.remindersEnabled && input.reminderFrequency
        ? calculateNextReminderDate(input.reminderFrequency, userTimezone)
        : null;

    const newGoal = {
      id: goalId,
      userId: session.user.id,
      title: input.title,
      description: input.description ?? null,
      type: input.type,
      goalType: input.goalType,
      targetValue: input.targetValue ?? null,
      currentValue: input.currentValue ?? "0",
      unit: input.unit ?? null,
      deadline: input.deadline ?? null,
      remindersEnabled: input.remindersEnabled,
      reminderFrequency: input.reminderFrequency ?? null,
      sortOrder: input.sortOrder ?? null,
      isActive: true,
      isCompleted: false,
      lastReminderSent: null,
      nextReminderDate,
    };

    const [createdGoal] = await db.insert(goals).values(newGoal).returning();

    return createdGoal;
  }
);
