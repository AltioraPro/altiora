import { and, desc, eq, gte, sql } from "drizzle-orm";
import {
    discordPomodoroSessions,
    discordProfile,
    user,
} from "@/server/db/schema";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { getLeaderboardSchema } from "../validators";

export const getLeaderboardBase = publicProcedure.input(getLeaderboardSchema);

export const getLeaderboardHandler = getLeaderboardBase.handler(
    async ({ context, input }) => {
        const { db } = context;
        const period = input.period;

        const now = new Date();
        let startDate: Date | null = null;

        switch (period) {
            case "week":
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case "year":
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = null;
                break;
        }

        // Build join conditions, filtering out undefined values
        const joinConditions = [
            eq(discordPomodoroSessions.userId, user.id),
            eq(discordPomodoroSessions.format, "deepwork"),
        ];

        if (startDate) {
            joinConditions.push(
                gte(discordPomodoroSessions.startedAt, startDate)
            );
        }

        const leaderboardData = await db
            .select({
                userId: user.id,
                name: user.name,
                discordUsername: discordProfile.discordUsername,
                rank: user.rank,
                image: user.image,
                discordAvatar: discordProfile.discordAvatar,
                discordId: discordProfile.discordId,
                totalWorkTime: sql<number>`COALESCE(SUM(${discordPomodoroSessions.totalWorkTime}), 0)`,
            })
            .from(user)
            .leftJoin(discordPomodoroSessions, and(...joinConditions))
            .leftJoin(discordProfile, eq(discordProfile.userId, user.id))
            .where(eq(user.isLeaderboardPublic, true))
            .groupBy(
                user.id,
                user.name,
                discordProfile.discordUsername,
                user.rank,
                user.image,
                discordProfile.discordAvatar,
                discordProfile.discordId
            )
            .orderBy(
                desc(
                    sql<number>`COALESCE(SUM(${discordPomodoroSessions.totalWorkTime}), 0)`
                )
            )
            .limit(100);

        return leaderboardData.map((entry, index) => ({
            rank: index + 1,
            userId: entry.userId,
            name: entry.discordUsername || entry.name,
            userRank: entry.rank,
            image: entry.discordAvatar || entry.image,
            discordId: entry.discordId,
            totalWorkHours: Math.floor(Number(entry.totalWorkTime) / 60),
            totalWorkMinutes: Number(entry.totalWorkTime) % 60,
        }));
    }
);
