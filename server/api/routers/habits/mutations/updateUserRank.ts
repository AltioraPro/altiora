import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/server/db";
import { users, habitCompletions } from "@/server/db/schema";
import { DiscordService } from "@/server/services/discord";

export async function updateUserRank(userId: string) {
  try {
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

    const activeDates = new Set(allCompletions.map(c => c.completionDate));


    let currentStreak = 0;
    const currentDate = new Date();
    
    for (let i = 0; i < 365; i++) { 
      const checkDate = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = checkDate.toISOString().split('T')[0]!;
      
      if (activeDates.has(dateStr)) {
        currentStreak++;
      } else {
        break; 
      }
    }
    let newRank = "NEW";
    if (currentStreak >= 365) newRank = "IMMORTAL";
    else if (currentStreak >= 180) newRank = "GRANDMASTER";
    else if (currentStreak >= 90) newRank = "MASTER";
    else if (currentStreak >= 30) newRank = "LEGEND";
    else if (currentStreak >= 14) newRank = "EXPERT";
    else if (currentStreak >= 7) newRank = "CHAMPION";
    else if (currentStreak >= 3) newRank = "RISING";
    else if (currentStreak >= 1) newRank = "BEGINNER";


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


    if (updatedUser.discordConnected && updatedUser.discordId && newRank !== user.rank) {
      console.log(`🔄 [Rank Update] Synchronisation Discord déclenchée pour ${updatedUser.id}`);
      console.log(`📊 [Rank Update] Ancien rank: ${user.rank} -> Nouveau rank: ${newRank}`);
      console.log(`👤 [Rank Update] Discord ID: ${updatedUser.discordId}`);
      
      try {
        await DiscordService.autoSyncUserRank(updatedUser.discordId, newRank);
        

        await db.update(users)
          .set({
            discordRoleSynced: true,
            lastDiscordSync: new Date(),
          })
          .where(eq(users.id, userId));
          
      } catch (syncError) {
        console.error(`❌`, syncError);

      }
    } else {
      console.log(`yes`);
    }

    return {
      ...updatedUser,
      previousRank: user.rank,
      currentStreak,
      totalActiveDays: activeDates.size,
    };
  } catch (error) {
    console.error("Error while updating rank:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error while updating rank",
    });
  }
} 