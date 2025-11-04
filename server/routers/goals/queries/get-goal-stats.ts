import { and, eq, lte, sql } from "drizzle-orm";
import { goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { getGoalStatsValidator } from "../validators";

export const getGoalStatsBase = protectedProcedure.input(getGoalStatsValidator);

export const getGoalStatsHandler = getGoalStatsBase.handler(
    async ({ context }) => {
        const { db, session } = context;
        const now = new Date();

        const [totalResult, completedResult, overdueResult, activeResult] =
            await Promise.all([
                db
                    .select({ count: sql<number>`count(*)` })
                    .from(goals)
                    .where(
                        and(
                            eq(goals.userId, session.user.id),
                            eq(goals.isActive, true)
                        )
                    ),

                db
                    .select({ count: sql<number>`count(*)` })
                    .from(goals)
                    .where(
                        and(
                            eq(goals.userId, session.user.id),
                            eq(goals.isActive, true),
                            eq(goals.isCompleted, true)
                        )
                    ),

                db
                    .select({ count: sql<number>`count(*)` })
                    .from(goals)
                    .where(
                        and(
                            eq(goals.userId, session.user.id),
                            eq(goals.isActive, true),
                            eq(goals.isCompleted, false),
                            lte(goals.deadline, now)
                        )
                    ),

                db
                    .select({ count: sql<number>`count(*)` })
                    .from(goals)
                    .where(
                        and(
                            eq(goals.userId, session.user.id),
                            eq(goals.isActive, true),
                            eq(goals.isCompleted, false),
                            sql`(${goals.deadline} > NOW() OR ${goals.deadline} IS NULL)`
                        )
                    ),
            ]);

        const total = Number(totalResult[0]?.count || 0);
        const completed = Number(completedResult[0]?.count || 0);
        const overdue = Number(overdueResult[0]?.count || 0);
        const active = Number(activeResult[0]?.count || 0);
        const completionRate =
            total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            overdue,
            active,
            completionRate,
        };
    }
);
