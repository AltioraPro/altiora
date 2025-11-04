import { and, asc, desc, eq } from "drizzle-orm";
import { goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { getGoalsByTypeValidator } from "../validators";

export const getGoalsByTypeBase = protectedProcedure.input(
    getGoalsByTypeValidator
);

export const getGoalsByTypeHandler = getGoalsByTypeBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { type } = input;

        return await db
            .select()
            .from(goals)
            .where(and(eq(goals.userId, session.user.id), eq(goals.type, type)))
            .orderBy(asc(goals.sortOrder), desc(goals.createdAt));
    }
);
