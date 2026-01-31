import { render } from "@react-email/components";
import { eq } from "drizzle-orm";
import WaitlistConfirmationTemplate from "@/emails/waitlist-confirmation";
import { env } from "@/env";
import { resend } from "@/lib/resend";
import { waitlist } from "@/server/db/schema";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { joinWaitlistSchema } from "../validators";

export const joinWaitlistBase = publicProcedure.input(joinWaitlistSchema);

export const joinWaitlistHandler = joinWaitlistBase.handler(
    async ({ input, context }) => {
        const { db } = context;

        // Check if email already exists
        const existing = await db
            .select({ id: waitlist.id })
            .from(waitlist)
            .where(eq(waitlist.email, input.email.toLowerCase()))
            .limit(1);

        if (existing.length > 0) {
            return { success: true, alreadyExists: true };
        }

        // Insert into database
        await db.insert(waitlist).values({
            email: input.email.toLowerCase(),
            firstName: input.firstName,
        });

        // Add to Resend audience (non-blocking)
        const audienceId = env.RESEND_WAITLIST_AUDIENCE_ID;
        if (audienceId) {
            resend.contacts
                .create({
                    audienceId,
                    email: input.email.toLowerCase(),
                    firstName: input.firstName,
                    unsubscribed: false,
                })
                .catch((error) => {
                    console.error("Failed to add contact to Resend:", error);
                });
        }

        // Send confirmation email
        const html = await render(
            WaitlistConfirmationTemplate({ firstName: input.firstName })
        );

        await resend.emails.send({
            from: "Altiora <noreply@altiora.pro>",
            to: input.email,
            subject: "Bienvenue sur la waitlist Altiora !",
            html,
        });

        return { success: true, alreadyExists: false };
    }
);
