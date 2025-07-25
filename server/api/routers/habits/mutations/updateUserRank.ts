import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/server/db";
import { users, habitCompletions } from "@/server/db/schema";

export async function updateUserRank(userId: string) {
  try {
    // Récupérer les statistiques actuelles de l'utilisateur
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        rank: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Utilisateur non trouvé",
      });
    }

    // Récupérer toutes les completions de l'utilisateur
    const recentCompletions = await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.userId, userId),
          eq(habitCompletions.isCompleted, true)
        )
      )
      .orderBy(habitCompletions.completionDate);

    // Calculer le streak actuel
    let currentStreak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = checkDate.toISOString().split('T')[0]!;
      
      const hasCompletion = recentCompletions.some(
        completion => completion.completionDate === dateStr
      );
      
      if (hasCompletion) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Déterminer le nouveau rank basé sur le streak
    let newRank = "NEW";
    if (currentStreak >= 30) newRank = "LEGEND";
    else if (currentStreak >= 14) newRank = "EXPERT";
    else if (currentStreak >= 7) newRank = "CHAMPION";
    else if (currentStreak >= 3) newRank = "RISING";
    else if (currentStreak >= 1) newRank = "BEGINNER";

    // Mettre à jour le rank
    const [updatedUser] = await db
      .update(users)
      .set({
        rank: newRank,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        rank: users.rank,
        updatedAt: users.updatedAt,
      });

    return {
      ...updatedUser,
      previousRank: user.rank,
      currentStreak,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rank:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erreur lors de la mise à jour du rank",
    });
  }
} 