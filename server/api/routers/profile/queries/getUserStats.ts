import { eq, and, count, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { users, habits, trades } from "@/server/db/schema";
import { type AuthQueryContext } from "../../auth/queries/types";

export async function getUserStats({ db, session }: AuthQueryContext) {
  if (!session?.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  try {
    // Get habit statistics
    const habitsStats = await db
      .select({
        totalHabits: count(habits.id),
        activeHabits: count(habits.id),
      })
      .from(habits)
      .where(
        and(
          eq(habits.userId, session.userId),
          eq(habits.isActive, true)
        )
      );

    // Get trading statistics
    const tradesStats = await db
      .select({
        totalTrades: count(trades.id),
      })
      .from(trades)
      .where(eq(trades.userId, session.userId));

    // Get user information
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: {
        rank: true,
        subscriptionPlan: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Calculate days since registration
    const daysSinceRegistration = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      habits: {
        total: habitsStats[0]?.totalHabits || 0,
        active: habitsStats[0]?.activeHabits || 0,
      },
      trades: {
        total: tradesStats[0]?.totalTrades || 0,
      },
      user: {
        rank: user.rank,
        subscriptionPlan: user.subscriptionPlan,
        daysSinceRegistration,
      },
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    
    console.error("Error retrieving statistics:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error retrieving statistics",
    });
  }
} 