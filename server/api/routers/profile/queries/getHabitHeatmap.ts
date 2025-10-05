import { eq, and, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { habitCompletions } from "@/server/db/schema";
import { type AuthQueryContext } from "../../auth/queries/types";

export async function getHabitHeatmap({ db, session }: AuthQueryContext) {
  if (!session?.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  try {
    // Get completions from last 365 days
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const startDate = oneYearAgo.toISOString().split('T')[0];

    const completions = await db
      .select({
        completionDate: habitCompletions.completionDate,
        isCompleted: habitCompletions.isCompleted,
      })
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.userId, session.userId),
          gte(habitCompletions.completionDate, startDate),
          eq(habitCompletions.isCompleted, true)
        )
      );

    // Group by date and count completions
    const heatmapData = completions.reduce((acc, completion) => {
      const date = completion.completionDate;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return heatmapData;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    
    console.error("Error retrieving habit heatmap:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error retrieving habit heatmap",
    });
  }
}

