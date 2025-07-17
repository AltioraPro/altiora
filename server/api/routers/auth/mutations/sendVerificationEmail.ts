import { db } from "@/server/db";
import { users, verifications } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { nanoid } from "nanoid";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendVerificationEmailParams {
  email: string;
}

export async function sendVerificationEmail({ email }: SendVerificationEmailParams) {
  // Vérifier si l'utilisateur existe
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user.length) {
    throw new Error("User not found");
  }

  const userData = user[0];

  // Si déjà vérifié, pas besoin de renvoyer
  if (userData.emailVerified) {
    throw new Error("Email already verified");
  }

  // Supprimer les anciennes vérifications pour cet email
  await db.delete(verifications).where(eq(verifications.identifier, email));

  // Créer un nouveau token de vérification
  const token = nanoid();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

  await db.insert(verifications).values({
    id: nanoid(),
    identifier: email,
    value: token,
    expiresAt,
  });

  // Construire l'URL de vérification
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

  // Envoyer l'email
  await resend.emails.send({
    from: "Altiora <onboarding@altiora.pro>",
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <img src="${baseUrl}/img/logo.png" alt="ALTIORA" style="height: 60px; width: auto; margin-bottom: 16px;" />
          <p style="color: #999; margin: 8px 0 0 0;">Personal coaching platform</p>
        </div>
        
        <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
          <h2 style="color: #fff; margin: 0 0 16px 0; font-size: 24px;">Welcome to Altiora!</h2>
          <p style="color: #ccc; margin: 0 0 24px 0; line-height: 1.6;">
            Complete your account setup by verifying your email address. Click the button below to get started.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" style="background: #fff; color: #000; padding: 16px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin: 24px 0 0 0; text-align: center;">
            This link will expire in 24 hours.
          </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">If you didn't create this account, please ignore this email.</p>
          <p style="margin: 8px 0 0 0;">© 2024 Altiora. All rights reserved.</p>
        </div>
      </div>
    `,
  });

  return { success: true, message: "Verification email sent" };
} 