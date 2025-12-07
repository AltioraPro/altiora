import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { resend } from "@/lib/resend";
import { user, verification } from "@/server/db/schema";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { sendVerificationEmailSchema } from "../validators";

export const sendVerificationEmailBase = publicProcedure.input(
    sendVerificationEmailSchema
);

export const sendVerificationEmailHandler = sendVerificationEmailBase.handler(
    async ({ context, input }) => {
        const { db } = context;
        const { email } = input;

        const [userData] = await db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

        if (!userData) {
            throw new ORPCError("NOT_FOUND", {
                message: "User not found",
            });
        }

        if (userData.emailVerified) {
            throw new ORPCError("BAD_REQUEST", {
                message: "Email already verified",
            });
        }

        await db.delete(verification).where(eq(verification.identifier, email));

        const token = nanoid();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

        const now = new Date();
        await db.insert(verification).values({
            id: nanoid(),
            identifier: email,
            value: token,
            expiresAt,
            createdAt: now,
            updatedAt: now,
        });

        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

        // Envoyer l'email
        await resend.emails.send({
            from: "Altiora <noreply@altiora.pro>",
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
);
