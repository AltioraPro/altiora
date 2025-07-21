import { db } from "@/server/db";
import { users, verifications } from "@/server/db/schema";
import { eq, and, gt } from "drizzle-orm";

interface VerifyEmailParams {
  token: string;
}

export async function verifyEmail({ token }: VerifyEmailParams) {
  // Trouver la vérification avec ce token
  const verification = await db.select()
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

  // Trouver l'utilisateur correspondant
  const user = await db.select()
    .from(users)
    .where(eq(users.email, verificationData.identifier))
    .limit(1);

  if (!user.length) {
    throw new Error("User not found");
  }

  const userData = user[0];

  // Si déjà vérifié, retourner succès
  if (userData.emailVerified) {
    // Supprimer le token utilisé
    await db.delete(verifications).where(eq(verifications.id, verificationData.id));
    return { success: true, message: "Email already verified", alreadyVerified: true };
  }

  // Mettre à jour le statut de vérification de l'utilisateur
  await db.update(users)
    .set({ 
      emailVerified: true,
      updatedAt: new Date()
    })
    .where(eq(users.id, userData.id));

  // Supprimer le token utilisé
  await db.delete(verifications).where(eq(verifications.id, verificationData.id));

  return { 
    success: true, 
    message: "Email verified successfully", 
    alreadyVerified: false,
    userId: userData.id 
  };
} 