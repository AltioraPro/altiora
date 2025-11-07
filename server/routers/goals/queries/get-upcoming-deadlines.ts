import { and, asc, eq, gte, lte } from "drizzle-orm";
import { goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { getUpcomingDeadlinesValidator } from "../validators";

export const getUpcomingDeadlinesBase = protectedProcedure.input(
    getUpcomingDeadlinesValidator
);

export const getUpcomingDeadlinesHandler = getUpcomingDeadlinesBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { days } = input;

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        return await db
            .select()
            .from(goals)
            .where(
                and(
                    eq(goals.userId, session.user.id),
                    eq(goals.isCompleted, false),
                    eq(goals.isActive, true),
                    gte(goals.deadline, new Date()),
                    lte(goals.deadline, futureDate)
                )
            )
            .orderBy(asc(goals.deadline));
    }
);
