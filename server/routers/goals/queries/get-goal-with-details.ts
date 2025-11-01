import { ORPCError } from "@orpc/client";
import { and, asc, eq } from "drizzle-orm";
import { goals, goalTasks, subGoals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { getGoalByIdValidator } from "../validators";

export const getGoalWithDetailsBase =
    protectedProcedure.input(getGoalByIdValidator);

export const getGoalWithDetailsHandler = getGoalWithDetailsBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { id } = input;

        const goalResults = await db
            .select()
            .from(goals)
            .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
            .limit(1);

        const goal = goalResults[0];

        if (!goal) {
            throw new ORPCError("NOT_FOUND", {
                message: "Goal not found",
            });
        }

        const subGoalsList = await db
            .select()
            .from(subGoals)
            .where(
                and(
                    eq(subGoals.goalId, id),
                    eq(subGoals.userId, session.user.id)
                )
            )
            .orderBy(asc(subGoals.sortOrder));

        const tasks = await db
            .select()
            .from(goalTasks)
            .where(
                and(
                    eq(goalTasks.goalId, id),
                    eq(goalTasks.userId, session.user.id)
                )
            )
            .orderBy(asc(goalTasks.sortOrder));

        return {
            goal,
            subGoals: subGoalsList,
            tasks,
        };
    }
);
