import { ORPCError } from "@orpc/client";
import { and, eq, gt } from "drizzle-orm";
import { user, verification } from "@/server/db/schema";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { verifyEmailSchema } from "../validators";

export const verifyEmailBase = publicProcedure.input(verifyEmailSchema);

export const verifyEmailHandler = verifyEmailBase.handler(
    async ({ context, input }) => {
        const { db } = context;
        const { token } = input;

        return await db.transaction(async (tx) => {
            const [verificationData] = await tx
                .select()
                .from(verification)
                .where(
                    and(
                        eq(verification.value, token),
                        gt(verification.expiresAt, new Date())
                    )
                )
                .limit(1);

            if (!verificationData) {
                throw new ORPCError("BAD_REQUEST", {
                    message: "Invalid or expired verification token",
                });
            }

            const [userData] = await tx
                .select()
                .from(user)
                .where(eq(user.email, verificationData.identifier))
                .limit(1);

            if (!userData) {
                throw new ORPCError("NOT_FOUND", {
                    message: "User not found",
                });
            }

            if (userData.emailVerified) {
                await tx
                    .delete(verification)
                    .where(eq(verification.id, verificationData.id));
                return {
                    success: true,
                    message: "Email already verified",
                    alreadyVerified: true,
                };
            }

            await tx
                .update(user)
                .set({
                    emailVerified: true,
                    updatedAt: new Date(),
                })
                .where(eq(user.id, userData.id));

            await tx
                .delete(verification)
                .where(eq(verification.id, verificationData.id));

            return {
                success: true,
                message: "Email verified successfully",
                alreadyVerified: false,
                userId: userData.id,
            };
        });
    }
);
