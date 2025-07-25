import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/server/db";
import { users, habitCompletions } from "@/server/db/schema";
import { DiscordService } from "@/server/services/discord";

export async function updateUserRank(userId: string) {
  try {
    // Récupérer l'utilisateur actuel
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        rank: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Utilisateur non trouvé",
      });
    }

    // Récupérer toutes les validations d'habitudes de l'utilisateur
    const allCompletions = await db
      .select({
        completionDate: habitCompletions.completionDate,
      })
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.userId, userId),
          eq(habitCompletions.isCompleted, true)
        )
      )
      .orderBy(habitCompletions.completionDate);

    // Créer un Set des dates uniques où au moins une habitude a été validée
    const activeDates = new Set(allCompletions.map(c => c.completionDate));

    console.log(`📊 [Rank Update] Utilisateur ${userId}: ${activeDates.size} jours avec au moins une validation`);

    // Calculer le streak actuel (jours consécutifs avec au moins une validation)
    let currentStreak = 0;
    const currentDate = new Date();
    
    for (let i = 0; i < 365; i++) { // Vérifier jusqu'à un an
      const checkDate = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = checkDate.toISOString().split('T')[0]!;
      
      if (activeDates.has(dateStr)) {
        currentStreak++;
      } else {
        break; // Arrêter dès qu'on trouve un jour sans validation
      }
    }

    console.log(`🔥 [Rank Update] Streak actuel: ${currentStreak} jours consécutifs`);

    // Déterminer le nouveau rank basé sur le streak
    let newRank = "NEW";
    if (currentStreak >= 365) newRank = "IMMORTAL";
    else if (currentStreak >= 180) newRank = "GRANDMASTER";
    else if (currentStreak >= 90) newRank = "MASTER";
    else if (currentStreak >= 30) newRank = "LEGEND";
    else if (currentStreak >= 14) newRank = "EXPERT";
    else if (currentStreak >= 7) newRank = "CHAMPION";
    else if (currentStreak >= 3) newRank = "RISING";
    else if (currentStreak >= 1) newRank = "BEGINNER";

    console.log(`📈 [Rank Update] Rank calculé: ${user.rank} -> ${newRank} (streak: ${currentStreak} jours)`);

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
        discordId: users.discordId,
        discordConnected: users.discordConnected,
      });

    // Synchroniser avec Discord si connecté
    if (updatedUser.discordConnected && updatedUser.discordId && newRank !== user.rank) {
      console.log(`🔄 [Rank Update] Synchronisation Discord déclenchée pour ${updatedUser.id}`);
      console.log(`📊 [Rank Update] Ancien rank: ${user.rank} -> Nouveau rank: ${newRank}`);
      console.log(`👤 [Rank Update] Discord ID: ${updatedUser.discordId}`);
      
      try {
        await DiscordService.autoSyncUserRank(updatedUser.discordId, newRank);
        
        // Mettre à jour le statut de synchronisation
        await db.update(users)
          .set({
            discordRoleSynced: true,
            lastDiscordSync: new Date(),
          })
          .where(eq(users.id, userId));
          
        console.log(`✅ [Rank Update] Synchronisation Discord réussie pour ${updatedUser.id}`);
      } catch (syncError) {
        console.error(`❌ [Rank Update] Échec de la synchronisation Discord pour ${updatedUser.id}:`, syncError);
        // Ne pas échouer complètement si la synchronisation échoue
      }
    } else {
      console.log(`ℹ️ [Rank Update] Pas de synchronisation Discord: connected=${updatedUser.discordConnected}, discordId=${updatedUser.discordId}, rankChanged=${newRank !== user.rank}`);
    }

    return {
      ...updatedUser,
      previousRank: user.rank,
      currentStreak,
      totalActiveDays: activeDates.size,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rank:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erreur lors de la mise à jour du rank",
    });
  }
} 