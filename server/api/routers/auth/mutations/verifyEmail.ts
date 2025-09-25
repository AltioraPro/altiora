import { db } from "@/server/db";
import { users, verifications } from "@/server/db/schema";
import { eq, and, gt } from "drizzle-orm";

interface VerifyEmailParams {
  token: string;
}

export async function verifyEmail({ token }: VerifyEmailParams) {   
  return await db.transaction(async (tx) => {
    const verification = await tx.select()
      .from(verifications)
      .where(
        and(
          eq(verifications.value, token),
          gt(verifications.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!verification.length) {
      throw new Error("Invalid or expired verification token");
    }

    const verificationData = verification[0];

    const user = await tx.select()
      .from(users)
      .where(eq(users.email, verificationData.identifier))
      .limit(1);

    if (!user.length) {
      throw new Error("User not found");
    }

    const userData = user[0];

    if (userData.emailVerified) {
      await tx.delete(verifications).where(eq(verifications.id, verificationData.id));
      return { success: true, message: "Email already verified", alreadyVerified: true };
    }

    await tx.update(users)
      .set({ 
        emailVerified: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userData.id));

    await tx.delete(verifications).where(eq(verifications.id, verificationData.id));

    return { 
      success: true, 
      message: "Email verified successfully", 
      alreadyVerified: false,
      userId: userData.id 
    };
  });
} 