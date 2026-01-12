import { eq } from "drizzle-orm";
import { z } from "zod";
import { subscription } from "@/server/db/schema/auth/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const updateUserSubscriptionSchema = z.object({
    userId: z.string().min(1),
    status: z.enum(["active", "canceled", "incomplete"]),
});

export const updateUserSubscriptionBase = protectedProcedure
    .errors({
        INTERNAL_SERVER_ERROR: {},
        NOT_FOUND: {},
    })
    .input(updateUserSubscriptionSchema);

export const updateUserSubscriptionHandler = updateUserSubscriptionBase.handler(
    async ({ input, context, errors }) => {
        const { userId, status } = input;
        const { db } = context;

        try {
            const existingSubscription = await db.query.subscription.findFirst({
                where: eq(subscription.referenceId, userId),
            });

            if (!existingSubscription) {
                throw errors.NOT_FOUND({
                    message: "No subscription found for this user",
                });
            }

            await db
                .update(subscription)
                .set({ status })
                .where(eq(subscription.referenceId, userId));

            return {
                success: true,
            };
        } catch (error) {
            if (error instanceof Error && error.message.includes("NOT_FOUND")) {
                throw error;
            }
            console.error("Failed to update subscription:", error);
            throw errors.INTERNAL_SERVER_ERROR();
        }
    }
);
