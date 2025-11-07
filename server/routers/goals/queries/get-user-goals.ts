import { asc, desc, eq } from "drizzle-orm";
import { goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const getUserGoalsBase = protectedProcedure;

export const getUserGoalsHandler = getUserGoalsBase.handler(
    async ({ context }) => {
        const { db, session } = context;

        return await db
            .select()
            .from(goals)
            .where(eq(goals.userId, session.user.id))
            .orderBy(asc(goals.sortOrder), desc(goals.createdAt));
    }
);
