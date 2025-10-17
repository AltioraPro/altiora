import { desc, eq, and, sql, count, gte } from "drizzle-orm";
import { users, discordPomodoroSessions } from "@/server/db/schema";
import type { AuthQueryContext } from "../../auth/queries/types";

type Period = "all" | "week" | "month" | "year";

export async function getLeaderboard(
  { db }: AuthQueryContext,
  period: Period = "all"
) {
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
    case "all":
    default:
      startDate = null;
      break;
  }
  const leaderboardData = await db
    .select({
      userId: users.id,
      name: users.name,
      discordUsername: users.discordUsername,
      rank: users.rank,
      image: users.image,
      discordAvatar: users.discordAvatar,
      discordId: users.discordId,
      totalWorkTime:
        sql<number>`COALESCE(SUM(${discordPomodoroSessions.totalWorkTime}), 0)`.as(
          "total_work_time"
        ),
    })
    .from(users)
    .leftJoin(
      discordPomodoroSessions,
      and(
        eq(discordPomodoroSessions.userId, users.id),
        eq(discordPomodoroSessions.format, "deepwork"),
        startDate
          ? gte(discordPomodoroSessions.startedAt, startDate)
          : undefined
      )
    )
    .where(eq(users.isLeaderboardPublic, true))
    .groupBy(
      users.id,
      users.name,
      users.discordUsername,
      users.rank,
      users.image,
      users.discordAvatar,
      users.discordId
    )
    .orderBy(
      desc(sql`COALESCE(SUM(${discordPomodoroSessions.totalWorkTime}), 0)`)
    )
    .limit(100);

  return leaderboardData.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    name: entry.discordUsername || entry.name,
    userRank: entry.rank,
    image: entry.image,
    discordAvatar: entry.discordAvatar,
    discordId: entry.discordId,
    totalWorkHours: Math.floor((entry.totalWorkTime || 0) / 60),
    totalWorkMinutes: (entry.totalWorkTime || 0) % 60,
  }));
}
