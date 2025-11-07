import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { discordProfile, habitCompletions, user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { DiscordService } from "@/server/services/discord";

export const updateUserRankBase = protectedProcedure;

export const updateUserRankHandler = updateUserRankBase.handler(
    async ({ context }) => {
        try {
            const { db, session } = context;
            const userId = session.user.id;

            const userData = await db.query.user.findFirst({
                where: eq(user.id, userId),
                columns: {
                    id: true,
                    rank: true,
                },
            });

            if (!userData) {
                throw new ORPCError("NOT_FOUND", {
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

            const activeDates = new Set(
                allCompletions.map((c) => c.completionDate)
            );

            let currentStreak = 0;
            const currentDate = new Date();

            for (let i = 0; i < 365; i++) {
                const checkDate = new Date(
                    currentDate.getTime() - i * 24 * 60 * 60 * 1000
                );
                const dateStr = checkDate.toISOString().split("T")[0] ?? "";

                if (activeDates.has(dateStr)) {
                    currentStreak++;
                } else {
                    break;
                }
            }
            let newRank = "NEW";
            if (currentStreak >= 365) {
                newRank = "IMMORTAL";
            } else if (currentStreak >= 180) {
                newRank = "GRANDMASTER";
            } else if (currentStreak >= 90) {
                newRank = "MASTER";
            } else if (currentStreak >= 30) {
                newRank = "LEGEND";
            } else if (currentStreak >= 14) {
                newRank = "EXPERT";
            } else if (currentStreak >= 7) {
                newRank = "CHAMPION";
            } else if (currentStreak >= 3) {
                newRank = "RISING";
            } else if (currentStreak >= 1) {
                newRank = "BEGINNER";
            }

            const [updatedUser] = await db
                .update(user)
                .set({
                    rank: newRank,
                    updatedAt: new Date(),
                })
                .where(eq(user.id, userId))
                .returning({
                    id: user.id,
                    rank: user.rank,
                    updatedAt: user.updatedAt,
                    discordId: discordProfile.discordId,
                    discordConnected: discordProfile.discordConnected,
                });

            if (
                updatedUser.discordConnected &&
                updatedUser.discordId &&
                newRank !== userData.rank
            ) {
                console.info(
                    `🔄 [Rank Update] Synchronisation Discord déclenchée pour ${updatedUser.id}`
                );
                console.info(
                    `📊 [Rank Update] Ancien rank: ${userData.rank} -> Nouveau rank: ${newRank}`
                );
                console.info(
                    `👤 [Rank Update] Discord ID: ${updatedUser.discordId}`
                );

                try {
                    await DiscordService.autoSyncUserRank(
                        updatedUser.discordId,
                        newRank
                    );

                    const now = new Date();
                    await db
                        .update(discordProfile)
                        .set({
                            discordRoleSynced: true,
                            lastDiscordSync: now,
                        })
                        .where(eq(discordProfile.id, updatedUser.id));
                } catch (syncError) {
                    console.error("Error while syncing rank:", syncError);
                }
            } else {
                console.info("User rank is already up to date");
            }

            return {
                ...updatedUser,
                previousRank: user.rank,
                currentStreak,
                totalActiveDays: activeDates.size,
            };
        } catch (error) {
            console.error("Error while updating rank:", error);
            if (error instanceof ORPCError) {
                throw error;
            }
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Error while updating rank",
            });
        }
    }
);
