import { and, eq, gt } from "drizzle-orm";
import { db } from "@/server/db";
import { user, verification } from "@/server/db/schema";

interface VerifyEmailParams {
    token: string;
}

export async function verifyEmail({ token }: VerifyEmailParams) {
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
            throw new Error("Invalid or expired verification token");
        }

        const [userData] = await tx
            .select()
            .from(user)
            .where(eq(user.email, verificationData.identifier))
            .limit(1);

        if (!userData) {
            throw new Error("User not found");
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
