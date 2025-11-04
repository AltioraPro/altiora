import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { discordProfile, goals, user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { DiscordService } from "@/server/services/discord";
import { markGoalCompletedValidator } from "../validators";

export const markGoalCompletedBase = protectedProcedure.input(
    markGoalCompletedValidator
);

export const markGoalCompletedHandler = markGoalCompletedBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { id, isCompleted } = input;

        const [updatedGoal] = await db
            .update(goals)
            .set({
                isCompleted,
                updatedAt: new Date(),
            })
            .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
            .returning();

        if (!updatedGoal) {
            throw new ORPCError("NOT_FOUND", {
                message: "Goal not found",
            });
        }

        if (isCompleted && updatedGoal) {
            try {
                const [userData] = await db
                    .select({
                        discordId: discordProfile.discordId,
                        discordConnected: discordProfile.discordConnected,
                    })
                    .from(user)
                    .leftJoin(
                        discordProfile,
                        eq(user.id, discordProfile.userId)
                    )
                    .where(eq(user.id, session.user.id));

                if (userData?.discordId && userData?.discordConnected) {
                    await DiscordService.sendGoalCompletion(
                        userData.discordId,
                        {
                            id: updatedGoal.id,
                            title: updatedGoal.title,
                            description: updatedGoal.description,
                            deadline: updatedGoal.deadline,
                            userId: updatedGoal.userId,
                        }
                    );
                }
            } catch (error) {
                console.error("Error sending Discord notification:", error);
            }
        }

        return updatedGoal;
    }
);
