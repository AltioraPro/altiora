import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { getGoalByIdValidator } from "../validators";

export const getGoalByIdBase = protectedProcedure.input(getGoalByIdValidator);

export const getGoalByIdHandler = getGoalByIdBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { id } = input;

        const results = await db
            .select()
            .from(goals)
            .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
            .limit(1);

        const goal = results[0];

        if (!goal) {
            throw new ORPCError("NOT_FOUND", {
                message: "Goal not found",
            });
        }

        return goal;
    }
);
