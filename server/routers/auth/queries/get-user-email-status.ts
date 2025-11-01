import { eq } from "drizzle-orm";
import { user } from "@/server/db/schema";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { getUserEmailStatusSchema } from "../validators";

export const getUserEmailStatusBase = publicProcedure.input(
    getUserEmailStatusSchema
);

export const getUserEmailStatusHandler = getUserEmailStatusBase.handler(
    async ({ context, input }) => {
        const { db } = context;
        const { email } = input;

        const [userData] = await db
            .select({
                id: user.id,
                email: user.email,
                emailVerified: user.emailVerified,
            })
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

        if (!userData) {
            return { exists: false, emailVerified: false };
        }

        return {
            exists: true,
            emailVerified: userData.emailVerified,
            userId: userData.id,
        };
    }
);
